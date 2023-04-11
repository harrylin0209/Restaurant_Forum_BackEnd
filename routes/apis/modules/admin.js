const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')
const upload = require('../../../middleware/multer')

router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.get('/restaurants/:id', adminController.getRestaurant) // 新增這一行
router.delete('/restaurants/:id', adminController.deleteRestaurant)

router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

router.put('/categories/:id', categoryController.putCategory)
router.delete('/categories/:id', categoryController.deleteCategory)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)

module.exports = router
