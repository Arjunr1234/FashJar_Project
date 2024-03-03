const order = require('../models/orderModel');
const product = require('../models/productModel')
const placeOrderHelper = require("../helper/placeOrderHelper");
const objectId = require("mongoose").Types.ObjectId



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


 const loadViewOrderDetails = async(req, res)=>{
  console.log("Entered into loadViewOrderDetails in orderController");

           try {     
                    const orderId = new objectId(req.query.orderId)
                  //  console.log("This is orderId : ",orderId)
                    const userData = req.session.user
                    const orderData = await order.findOne({_id:orderId})
                   // console.log("This is orderData: ",orderData);
                    const productId = orderData.products[0].product;
                   // console.log("This is product Id:,",productId)
                   const orders = [];
                   if(orderData){
                    for(let i=0; i<orderData.products.length; i++){
                        
                        const productData = await product.findOne({_id:orderData.products[i].product});
                        const orderDetails = orderData.products[i]
                        const productImage = productData.productImage;
                        const productName = productData.productName;
                      //  console.log("This is the product detais of each products:",productData);
                        const finalOrder = Object.assign({},
                          {image:productImage},
                          {name:productName},
                          {orderDetails:orderDetails} )
                          if(orders){
                            orders.push(finalOrder)
                          }
                       //   console.log("This is the final Order: ",orders)
                    }
                    
                   }
                    
                    
                    res.render("viewOrderDetails",{orders,userData});
                    
             } catch (error) {
                    console.log(error)
                    
              }
             
 }


module.exports = {
  placeOrder,
  loadSuccessPage,
  loadViewOrderDetails
}