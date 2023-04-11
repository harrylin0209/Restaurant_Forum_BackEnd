const express = require('express')
const router = express.Router()
// 新增，載入 controller
const restController = require('../../controllers/pages/restaurant-controller')
const userController = require('../../controllers/pages/user-controller') // 新增這行
const commentController = require('../../controllers/pages/comment-controller') // 引入 controller
const { authenticated, authenticatedAdmin } = require('../../middleware/auth') // 引入 auth.js

const { generalErrorHandler } = require('../../middleware/error-handler') // 加入這行
const passport = require('../../config/passport') // 引入 Passport，需要他幫忙做驗證
const upload = require('../../middleware/multer')
const admin = require('../pages/modules/admin') // 新增這行，載入 admin.js

router.use('/admin', authenticatedAdmin, admin) // 新增這行
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp) // 注意用 post
// 新增以下三行
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn) // 注意是 post
router.get('/logout', userController.logout)

router.get('/users/top', authenticated, userController.getTopUsers) // 新增這一行
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/restaurants/feeds', authenticated, restController.getFeeds) // 新增這一行
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant) // 新增這行
router.get('/restaurants', authenticated, restController.getRestaurants) // 修改這行，新增 authenticatedAdmin 參數

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment) // 加入這行
router.post('/comments', authenticated, commentController.postComment) // 加入路由設定

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.get('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler)

module.exports = router
