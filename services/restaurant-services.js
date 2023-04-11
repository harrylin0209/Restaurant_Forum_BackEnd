const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const restaurantServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category, // 拿出關聯的 Category model
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }, // 新增這行
        { model: User, as: 'LikedUsers' } // 新增這行
      ],
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.increment('viewCounts', { by: 1 })
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        return cb(null, {
          restaurant,
          isFavorited,
          isLiked
        })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
    Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return cb(null, {
          restaurant
        })
      })
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
    Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        return cb(null, {
          restaurants,
          comments
        })
      })
      .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
    const LIMIT = 10
    Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        // const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(f => f.id)
        const result = restaurants
          .map(r => ({
            ...r.toJSON(),
            favoritedCount: r.FavoritedUsers.length,
            // isFavorited: favoritedRestaurantsId.includes(r.id)
            isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => r.id === fr.id)
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)

        const topTenRestaurants = result.slice(0, LIMIT)

        return cb(null, { restaurants: topTenRestaurants })
      })
      .catch(err => cb(err))
  }
}
module.exports = restaurantServices
