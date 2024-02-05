const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const otpHelper = require("../helper/otpHelper");

router.get('/', userController.loginLoad);
router.post('/',userController.logUser);

router.get('/userHome',userController.loadUserHome)

router.get('/register',userController.loadRegister);
router.post('/register',userController.insertUser)

router.get('/logout',userController.loadLogout)

router.get('/sendotp',userController.loadOtpVerify)
router.post('/otp',otpHelper.sendOtp);

router.post('/verify-otp',otpHelper.verify);







module.exports = router
