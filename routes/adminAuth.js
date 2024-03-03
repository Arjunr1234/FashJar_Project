const express = require("express");
const router = express.Router()
const adminController = require("../controller/adminController");
const isAdmin = require("../middlewares/adminMiddleware");
const multer = require("multer");
const uploads = require("../middlewares/multer");
const adminIsLogin = require("../middlewares/adminIsLoginMiddleware");





router.get('/login',adminIsLogin,adminController.loadLogin);


router.post('/adminloging',adminIsLogin,adminController.loadAdminHome);
router.get('/adminHome',isAdmin,adminController.loadHome);

router.get('/logout',isAdmin ,adminController.loadAdminLogout)
router.get('/customerlist',isAdmin,adminController.loadCustomerList)

router.patch('/blockuser',isAdmin,adminController.blockUser);
router.get('/unblockuser',isAdmin,adminController.unblockUser)

router.get('/category',isAdmin, adminController.loadCategoryPage)
router.post('/addCategory',isAdmin,adminController.addCategory)
router.patch('/listUnlist',isAdmin,adminController.listUnlistCategory)
router.get('/categoryEdit',isAdmin,adminController.loadCategoryEdit)
router.post('/updateCategory',isAdmin,adminController.updateCategory)

//===============================products===================================

router.get('/products',isAdmin,adminController.loadProductPage);
router.get('/loadAddProduct',isAdmin,adminController.loadAddProduct);
router.post('/productAdd',isAdmin,uploads.array("images",4) ,adminController.addingProduct);
router.patch('/listUnlistProduct',isAdmin,adminController.listUnlistProduct);
router.get('/productEdit',isAdmin,adminController.loadProductEdit);
router.post('/editProduct',isAdmin,uploads.array("images"),adminController.editProducts);
router.post('/deleteImage',adminController.deleteImage);

//==============================Orders==========================================

router.get('/orders',isAdmin,adminController.loadOrderPage);




module.exports = router

