const express = require('express')
const router = express.Router()

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

const { apiErrorHandler } = require('../../middleware/error-handler')
const passport = require('../../config/passport')
const upload = require('../../middleware/multer')
const admin = require('./modules/admin')

router.use('/admin', authenticated, authenticatedAdmin, admin)
router.post('/signup', userController.signUp) // 注意用 post
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/users/top', authenticated, userController.getTopUsers) // 新增這一行
router.get('/users/:id', authenticated, userController.getUser)
// router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/restaurants/feeds', authenticated, restController.getFeeds) // 新增這一行
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant) // 新增這行
router.get('/restaurants', authenticated, restController.getRestaurants)

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment) // 加入這行
router.post('/comments', authenticated, commentController.postComment) // 加入路由設定

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.use('/', apiErrorHandler)

module.exports = router
