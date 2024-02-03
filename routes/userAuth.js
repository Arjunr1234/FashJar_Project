const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")

router.get('/', userController.loginLoad);
router.post('/',userController.logUser);

router.get('/userHome',userController.loadUserHome)

router.get('/register',userController.loadRegister);
router.post('/register',userController.insertUser)







module.exports = router
