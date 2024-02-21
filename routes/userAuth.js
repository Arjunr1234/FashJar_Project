const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const otpHelper = require("../helper/otpHelper");
const userHelper = require("../helper/userHelper");
const cartController = require("../controller/cartController")

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

// ================cart===============================

router.get('/loadCartPage',cartController.loadCartPage)

module.exports = router;


