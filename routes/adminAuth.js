const express = require("express");
const router = express.Router()
const adminController = require("../controller/adminController");
const adminSection2Controller = require("../controller/adminSection2Controller")
const isAdmin = require("../middlewares/adminMiddleware");
const multer = require("multer");
const uploads = require("../middlewares/multer");
const adminIsLogin = require("../middlewares/adminIsLoginMiddleware");
const { changeOfferStatus } = require("../middlewares/offerStatusMiddelware");
const { checkCoupon } = require("../middlewares/couponActiveMiddleware");






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
router.get('/viewOrderDetails',isAdmin,adminController.loadViewOrderPage);
router.post('/changeOrderStatus',isAdmin,adminController.changeOrderStatus);


//============================Offer==============================================

router.get('/loadCategoryOffer',isAdmin,adminSection2Controller.loadCategoryOfferPage);
router.get('/loadProductOffer',isAdmin,adminSection2Controller.loadProductOfferPage);
router.get('/loadAddProductOffer',isAdmin,adminSection2Controller.loadAddProductOffer);
router.get('/loadAddCategoryOffer',isAdmin,adminSection2Controller.loadAddCategoryOffer);
router.post('/PostProductOffer',isAdmin,adminSection2Controller.addingProductOffer);
router.post('/postCategoryOffer',isAdmin,adminSection2Controller.addCategoryOffer);
router.get('/deleteProductOffer',isAdmin,adminSection2Controller.deleteProductOffer);
router.get('/deleteCategoryOffer',isAdmin,adminSection2Controller.deleteCategoryOffer)
router.get('/editProductOffer',isAdmin,adminSection2Controller.loadEditProductOffer);
router.get('/editCategoryOffer',isAdmin,adminSection2Controller.loadEditCategoryOffer);
router.post('/updateProductOffer',isAdmin,adminSection2Controller.updateProductOffer);
router.post('/updateCategoryOffer',isAdmin,adminSection2Controller.updateCategoryOffer)

//===========================Coupon====================================================

router.get('/loadCouponPage',isAdmin,checkCoupon, adminSection2Controller.loadCouponPage);
router.post('/postAddCoupon',isAdmin, adminSection2Controller.createCoupons);
router.get('/loadCouponEdit',isAdmin,adminSection2Controller.loadCouponEdit);
router.post('/updateCoupon',isAdmin,adminSection2Controller.updateCoupon);
router.delete('/deleteCoupon',isAdmin,adminSection2Controller.deleteCoupon)





module.exports = router

