const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const otpHelper = require("../helper/otpHelper");
const userHelper = require("../helper/userHelper");
const cartController = require("../controller/cartController");
const profileController = require("../controller/profileController");
const orderController = require("../controller/orderController")


router.get('/', userController.loginLoad);
router.post('/userloging', userController.loginHome);

router.get('/userHome', userController.loadUserHome);
//router.post('/userHome', userController.logNewUser);

router.get('/register', userController.loadRegister);
// router.post('/register', userController.insertUser);

router.get('/logout', userController.loadLogout);
router.get('/sampleForCheck',userController.loadSample)

router.get('/sendotp', userController.loadOtpVerify);
router.post('/otp',userHelper.checkUserExist, otpHelper.sendOtp);

router.post('/verify-otp', userController.insertUserWithVerify);
// router.get('/resendOtp', otpHelper.sendOtp);
router.get('/resendOtp', userController.loadOtpVerify);
router.get('/viewProduct',userController.loadVeiwProduct)

router.post('/size/:id/:size', userController.displaySize)

//===============GuestUser===========================

router.get('/guestUser',userController.loadGuestUserHome)

// ================cart===============================

router.get('/loadCartPage',cartController.loadCartPage);
router.post('/addToCart', cartController.addToCart);
router.get('/productWithSizeCartCheck',cartController.productWithSizeCartCheck);
router.get('/deleteCartItems',cartController.deleteCartedItems);
router.patch('/changeQuantity',cartController.changeQuantity);
router.get('/proceedToCheckOut',cartController.loadCheckOutPage)


//================profiles=========================================

router.get('/profile',profileController.loadProfile)
router.post('/addaddress',profileController.saveUserAdress);
router.get('/deleteAddress',profileController.deleteAddress);
router.post('/changepassword',profileController.changePassword);
router.post('/editUserDetails',profileController.editUserDetails);
router.get('/addressEdit',profileController.loadAddressEdit);
router.post('/updateAddressData',profileController.updateUserAddress)
router.get('/viewOrders',profileController.loadOrderDetails)

//===================Order============================================

router.post('/placeOrder',orderController.placeOrder);
router.get('/orderIsPlaced',orderController.loadSuccessPage);

module.exports = router;


