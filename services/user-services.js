const { Restaurant, Comment, User, Favorite, Like, Followship } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const bcrypt = require('bcryptjs') // 載入 bcrypt

const userService = {
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        return cb(null, { status: 'success', message: '成功註冊帳號！' })
      })
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  getUser: (req, cb) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        const set = new Set()
        const newComments = user.toJSON().Comments.filter(comment => !set.has(comment.restaurantId) ? set.add(comment.restaurantId) : false)
        user = {
          ...user.toJSON(),
          Comments: newComments
        }
        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    if (Number(req.params.id) !== Number(req.user.id)) {
      return cb(null, { status: 'error', message: 'permission denied' })
    }
    const { file } = req
    if (file) {
      Promise.all([ // 非同步處理
        User.findByPk(req.params.id), // 去資料庫查有沒有這間餐廳
        imgurFileHandler(file) // 把檔案傳到 file-helper 處理
      ])
        .then(([user, filePath]) => { // 以上兩樣事都做完以後)
          if (!user) throw new Error("User didn't exist!")
          return user.update({
            name: req.body.name,
            image: filePath || user.image
          })
        })
        .then(updatedUser => cb(null, { user: updatedUser }))
        .catch(err => cb(err))
    //   imgurFileHandler.upload(file.path, (err, img) => {
    //     if (err) {
    //       return cb(err)
    //     }
    //     return User.findByPk(req.params.id)
    //       .then(user => {
    //         user.update({
    //           name: req.body.name,
    //           image: img.data.link
    //         }).then(() => {
    //           return cb(null, { status: 'success', message: 'updated successfully' })
    //         }).catch(err => {
    //           cb(err)
    //         })
    //       })
    //       .catch(err => {
    //         cb(err)
    //       })
    //   })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name
          }).then(user => {
            return cb(null, { status: 'success', message: 'updated name successfully' })
          }).catch(err => {
            cb(err)
          })
        })
        .catch(err => {
          cb(err)
        })
    }
  },
  addFavorite: (req, cb) => {
    Favorite.create({
      userId: req.user.id,
      restaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return cb(null, { status: 'success', message: '' })
      })
      .catch(err => {
        cb(err)
      })
  },
  removeFavorite: (req, cb) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(restaurant => {
            return cb(null, { status: 'success', message: '' })
          })
          .catch(err => {
            cb(err)
          })
      })
      .catch(err => {
        cb(err)
      })
  },
  addLike: (req, cb) => {
    return Like.create({
      userId: req.user.id,
      restaurantId: req.params.restaurantId
    }).then(restaurant => {
      return cb(null, { status: 'success', message: '' })
    }).catch(err => {
      cb(err)
    })
  },
  removeLike: (req, cb) => {
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    }).then(like => {
      like.destroy()
        .then(restaurant => {
          return cb(null, { status: 'success', message: '' })
        })
        .catch(err => {
          cb(err)
        })
    }).catch(err => {
      cb(err)
    })
  },
  getTopUsers: (req, cb) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings ? req.user.Followings.map(d => d.id).includes(user.id) : false
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      cb(null, { users: users })
    }).catch(err => {
      cb(err)
    })
  },
  addFollowing: (req, cb) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(followship => {
        return cb(null, { status: 'success', message: '' })
      })
      .catch(err => {
        cb(err)
      })
  },
  removeFollowing: (req, cb) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        followship.destroy()
          .then(followship => {
            return cb(null, { status: 'success', message: '' })
          })
          .catch(err => {
            cb(err)
          })
      })
      .catch(err => {
        cb(err)
      })
  }
}

module.exports = userService
