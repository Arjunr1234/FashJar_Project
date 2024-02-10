const express = require("express");
const router = express.Router()
const adminController = require("../controller/adminController");
const isAdmin = require("../controller/adminMiddleware");

router.get('/login',adminController.loadLogin);


router.post('/adminloging',adminController.loadAdminHome);
router.get('/adminHome',isAdmin,adminController.loadHome);

router.get('/logout',isAdmin ,adminController.loadAdminLogout)
router.get('/customerlist',isAdmin,adminController.loadCustomerList)

router.get('/blockuser',isAdmin,adminController.blockUser);
router.get('/unblockuser',isAdmin,adminController.unblockUser)



module.exports = router
