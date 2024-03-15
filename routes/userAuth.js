const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const otpHelper = require("../helper/otpHelper");
const userHelper = require("../helper/userHelper");
const cartController = require("../controller/cartController");
const profileController = require("../controller/profileController");
const orderController = require("../controller/orderController");
const wishlistController = require("../controller/wishlistController")
const isUser = require("../middlewares/userLoggingMiddleware");
const wishlist = require("../models/wishlistModel");


router.get('/', userController.loginLoad);
router.post('/userloging', userController.loginHome);

router.get('/userHome', userController.loadUserHome);
//router.post('/userHome', userController.logNewUser);

router.get('/register', userController.loadRegister);
// router.post('/register', userController.insertUser);

router.get('/logout',isUser, userController.loadLogout);
router.get('/sampleForCheck',isUser,userController.loadSample)

router.get('/sendotp', userController.loadOtpVerify);
router.post('/otp',userHelper.checkUserExist, otpHelper.sendOtp);

router.post('/verify-otp', userController.insertUserWithVerify);
 router.get('/resendOtp', otpHelper.resendOtp);
//router.get('/resendOtp', userController.loadOtpVerify);
router.get('/viewProduct',userController.loadVeiwProduct)

router.post('/size/:id/:size',isUser, userController.displaySize);

//==================Shop==============================
router.get('/shop',isUser,userController.loadShopProduct);
router.get('/filterCategory',isUser,userController.filterCatergoryProducts)

//===============GuestUser===========================

router.get('/guestUser',userController.loadGuestUserHome)

// ================cart===============================

router.get('/loadCartPage',isUser,cartController.loadCartPage);
router.post('/addToCart',isUser, cartController.addToCart);
router.get('/productWithSizeCartCheck',isUser,cartController.productWithSizeCartCheck);
router.get('/deleteCartItems',isUser,cartController.deleteCartedItems);
//router.patch('/changeQuantity',isUser,cartController.changeQuantity);
router.get('/proceedToCheckOut',isUser,cartController.loadCheckOutPage)
router.post('/incrementQuantity',isUser ,cartController.incrementQuantity);
router.post('/decrementQuantity',isUser,cartController.decreaseQuantity)


//================profiles=========================================

router.get('/profile',isUser, profileController.loadProfile)
router.post('/addaddress',isUser,profileController.saveUserAdress);
router.get('/deleteAddress',isUser,profileController.deleteAddress);
router.post('/changepassword',isUser,profileController.changePassword);
router.post('/editUserDetails',isUser,profileController.editUserDetails);
router.get('/addressEdit',isUser,profileController.loadAddressEdit);
router.post('/updateAddressData',isUser,profileController.updateUserAddress)
router.get('/viewOrders',isUser,profileController.loadOrderDetails)

//===================Order============================================

router.post('/placeOrder',isUser,orderController.placeOrder);
router.get('/orderIsPlaced',isUser,orderController.loadSuccessPage);
router.get('/viewOrderDetails',isUser,orderController.loadViewOrderDetails);
router.post('/deleteOrder',isUser,orderController.deleteOrder);
router.post('/retrunProduct',isUser,orderController.returnProduct);
router.get('/editAddressCheckout',isUser, orderController.loadAddressEditCheckout);
router.post('/updateAddressInCheckoutPage',isUser,orderController.updateAddress);

//===========================Wishlist========================================

router.get('/loadwishlist',isUser,wishlistController.loadWishlistPage);
router.post('/addToWishlist',isUser,wishlistController.addToWishlist);
router.post('/deleteWishlist',isUser,wishlistController.deleteWishlist);
router.post('/addToCartFromWishlist',isUser,wishlistController.addToCart)


//===========================================================================

module.exports = router;


