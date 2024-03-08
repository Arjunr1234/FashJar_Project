const order = require('../models/orderModel');
const product = require('../models/productModel')
const placeOrderHelper = require("../helper/placeOrderHelper");
const objectId = require("mongoose").Types.ObjectId;
//const { ObjectId } = require('mongodb');
const user = require("../models/userModel")




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
                        const orderedId = orderData._id
                        const orderDetails = orderData.products[i]
                        const productImage = productData.productImage;
                        const productName = productData.productName;
                      //  console.log("This is the product detais of each products:",productData);
                        const finalOrder = Object.assign({},
                          {image:productImage},
                          {name:productName},
                          {orderId:orderedId},
                          {orderDetails:orderDetails} )
                          if(orders){
                            orders.push(finalOrder)
                          }
                       //  
                    }
                    
                   }
                   console.log("This is the final Order: ",orders)
                    
                    res.render("viewOrderDetails",{orders,userData});
                    
             } catch (error) {
                    console.log(error)
                    
              }
             
 }

 const deleteOrder = async (req, res) => {
  console.log("Entered into delete order in the orderController");

  const { orderId, productId, size } = req.body;
  console.log("This is orderId: ", orderId);
  console.log("This is product id: ", productId);
  console.log("This is size: ", size);

  const deletingOrder = await order.updateOne(
    {
        "_id": new objectId(orderId),
        "products": {
            $elemMatch: {
                "product": new objectId(productId),
                "size": size
            }
        }
    },
    {
        $set: {
            "products.$.status": "Cancelled"
        }
    }
);
   console.log(deletingOrder)

   if(deletingOrder.modifiedCount>0){
    console.log("The order is cancelled!!");
    res.json({success:true})
   }else{
    console.log("The modified count is 0");
    res.json({success:false})
   }
  }

  const returnProduct = async(req, res)=>{
       console.log("Entered in to return Product of orderController");

       try {
            const {orderId, productId, size} = req.body;
            console.log("This is orderId : ",orderId);
            console.log("This is productId: ",productId);
            console.log("This is the size: ",size)

            const returnProduct = await order.updateOne(
              {
                  "_id": new objectId(orderId),
                  "products": {
                      $elemMatch: {
                          "product": new objectId(productId),
                          "size": size
                      }
                  }
              },
              {
                  $set: {
                      "products.$.status": "Return pending"
                  }
              }
          );

          console.log("This is return product:",returnProduct);

          if(returnProduct.modifiedCount>0){
            console.log("Product is updated to returned");
            res.json({success:true})
          }else{
            console.log("modified count is less than zero");
            res.json({success:false})
          }
        
       } catch (error) {
        console.log(error)
        
       }
             
  }

  const loadAddressEditCheckout = async(req, res)=>{
      console.log("Entered in to loadAddressEditCheckout in orderController");
      const addressId = req.query.addressId;
      
      
      console.log("This is the address Id: ",new objectId(addressId));
      const addressData = await user.findOne({_id:req.session.user._id},{"address":{$elemMatch:{_id:new objectId(addressId)}}})
      console.log("This is addressData :", addressData)
       res.render("EditAddressInCheckoutPage",{addressData})
                    
  }

  const updateAddress = async(req, res)=>{
    try {
         
      console.log("Entered into updateUserAddress of profileController");
      const addressId = req.query.addressId
      console.log(addressId)
      const userId = req.session.user._id;

      const receivedAddress = {
        name: req.body.addresName,
        mobile: req.body.addressmobile,
        houseName: req.body.housename,
        pincode: req.body.pincode,
        cityOrTown: req.body.townOrCity,
        district: req.body.district,
        state: req.body.state,
        country: req.body.country
      }

     const updatingAddress = await user.updateOne({_id:userId,"address._id":addressId},{$set:{"address.$":receivedAddress}});
     console.log(updatingAddress);
     res.redirect('/proceedToCheckOut')
      
     } catch (error) {
      console.log(error)
      
     }

  }

module.exports = {
  placeOrder,
  loadSuccessPage,
  loadViewOrderDetails,
  deleteOrder,
  returnProduct,
  loadAddressEditCheckout,
  updateAddress
}