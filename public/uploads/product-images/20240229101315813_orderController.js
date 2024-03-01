const order = require('../models/orderModel');
const placeOrderHelper = require("../helper/placeOrderHelper")



 const placeOrder = async(req, res)=>{

            console.log("Entered into placeorder in orderController");
            const receivedData = req.body;
            console.log("This is received Data:",receivedData)

            const userId = req.session.user._id;
            const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId)
 }


module.exports = {
  placeOrder
}