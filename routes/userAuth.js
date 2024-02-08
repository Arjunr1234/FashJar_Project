const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const otpHelper = require("../helper/otpHelper");

router.get('/', userController.loginLoad);
router.post('/userloging', userController.loginHome);

router.get('/userHome', userController.loadUserHome);
//router.post('/userHome', userController.logNewUser);

router.get('/register', userController.loadRegister);
// router.post('/register', userController.insertUser);

router.get('/logout', userController.loadLogout);

router.get('/sendotp', userController.loadOtpVerify);
router.post('/otp', otpHelper.sendOtp);

router.post('/verify-otp', userController.insertUserWithVerify);
// router.get('/resendOtp', otpHelper.sendOtp);
router.get('/resendOtp', userController.loadOtpVerify,otpHelper.reSendOtp);

module.exports = router;
