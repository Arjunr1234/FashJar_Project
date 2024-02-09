const express = require("express");
const router = express.Router()
const adminController = require("../controller/adminController");

router.get('/login',adminController.loadLogin);


router.post('/adminloging',adminController.loadAdminHome);
router.get('/adminHome',adminController.loadHome);

router.get('/logout',adminController.loadAdminLogout)
router.get('/customerlist',adminController.loadCustomerList)


module.exports = router
