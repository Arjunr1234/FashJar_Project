const order = require('../models/orderModel');
const placeOrderHelper = require("../helper/placeOrderHelper")



 const placeOrder = async(req, res)=>{

            console.log("Entered into placeorder in orderController");
            const receivedData = req.body;
            const userId = req.session.user._id;
            console.log("This is received Data in placedOrder:",receivedData)
            console.log("This is userId in placdOrder:",userId)
            
            const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId);
            console.log(placedOrder);
            if(placedOrder.status === true){
               console.log("hello world!!!")
               const clearedCart = await placeOrderHelper.clearCart(userId);
               console.log("This is cleared cart:",clearedCart)
               if(clearedCart.acknowledged){
                     console.log("Entered in to clearCart acknowledged");
                     res.json({success:true,url:"/orderIsPlaced"});
               }
            }else{
              res.json({success:false,message:placedOrder.message,url:"/loadCartPage"})
             }
           
 }

 const loadSuccessPage = (req, res)=>{
              console.log("Entered into loadSuccessPage in orderController");

              res.render("orderSuccessPage")
 }


module.exports = {
  placeOrder,
  loadSuccessPage
}