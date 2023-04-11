const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/pages/admin-controller')
const categoryController = require('../../../controllers/pages/category-controller')
const upload = require('../../../middleware/multer') // 載入 multer

router.get('/restaurants/create', adminController.createRestaurant) // 刪除 authenticatedAdmin
router.get('/restaurants/:id/edit', adminController.editRestaurant) // 新增這一行
router.get('/restaurants/:id', adminController.getRestaurant) // 新增這一行
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant) // 修改這一行為 put
router.delete('/restaurants/:id', adminController.deleteRestaurant) // 新增這一行
router.get('/restaurants', adminController.getRestaurants) // 修改這行，新增 authenticatedAdmin 參數
router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // 新增這行

router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

router.get('/categories/:id', categoryController.getCategories) // 新增這行
router.put('/categories/:id', categoryController.putCategory) // 新增這行
router.delete('/categories/:id', categoryController.deleteCategory) // 新增這行
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)

router.use('/', (req, res) => res.redirect('/admin/restaurants'))
module.exports = router
