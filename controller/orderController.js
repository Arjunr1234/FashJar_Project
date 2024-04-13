const order = require('../models/orderModel');
const product = require('../models/productModel')
const placeOrderHelper = require("../helper/placeOrderHelper");
const objectId = require("mongoose").Types.ObjectId;

const user = require("../models/userModel");
const wallet = require('../models/walletModel');
const cart = require("../models/cartModel");
const paymentHelper = require("../helper/paymentHelper");





 const placeOrder = async(req, res, next)=>{

         
           try {


            const receivedData = req.body;
            const userId = req.session.user._id;
            const couponId = receivedData.globalCouponId
            const totalPriceOfCart = parseInt(receivedData.totalPriceOfCart)
           



            if(receivedData.paymentMethod === 'Cash On Delivery'){
              const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId);
              
              if(placedOrder.status === true){
                
                 const clearedCart = await placeOrderHelper.clearCart(userId);
                
                 if(clearedCart.acknowledged){
                      
                       res.json({success:true,url:"/orderIsPlaced"});
                 }
              }else{
                res.json({success:false,message:placedOrder.message,url:"/loadCartPage"})
               }

            }else if(receivedData.paymentMethod === 'wallet'){
             

               const walletData = await wallet.findOne({userId:new objectId(req.session.user._id)});
               const walletBalance = parseInt(walletData.balance);
               


               if(totalPriceOfCart > walletBalance){


                 res.json({success:false, message:'Wallet has insufficient fund!!'})


               }else{


                const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId, couponId);
                
                if(placedOrder.status === true){
                   
                   const clearedCart = await placeOrderHelper.clearCart(userId);
                  
                   if(clearedCart.acknowledged){
                         
                         const data = {
                            amount:totalPriceOfCart,
                            date:new Date(),
                            paymentMethod:"Wallet Payment",
                            isReceived:false

                         }
                         const pushDatas = await wallet.updateOne(
                          {userId:new objectId(userId)},
                          { $push: { walletDatas: data } }
                         )
                         const decreaseWalletAmount = await wallet.updateOne(
                                       {userId:new objectId(userId)},
                                       { $inc: { balance: -totalPriceOfCart } } 
                          )

                         res.json({success:true,url:"/orderIsPlaced"});
                   }
                }else{
                  res.json({success:false,message:placedOrder.message,url:"/loadCartPage"})
                 }
  

               }
               
            }else if(receivedData.paymentMethod === 'Razorpay'){
             
              const payment = await paymentHelper.generateRazorpay(userId,totalPriceOfCart)
              
              res.json({razorpayStatus:true, instance:payment})
              
            }
            
           } catch (error) {
            console.log("Error in place order: ",error);
            next(error)
            
           }
           
           
 }

 const loadSuccessPage = (req, res)=>{
            

              res.render("orderSuccessPage")
 }


 const loadViewOrderDetails = async(req, res, next)=>{
  

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
                        const mainOrderStatus = orderData.status;
                        const productImage = productData.productImage;
                        const productName = productData.productName;
                        const orderAddress = orderData.address;
                        const couponData = orderData.coupon;
                        const totalAmount = orderData.totalAmount;
                        const payment = orderData.paymentMethod
                      //  console.log("This is the product detais of each products:",productData);
                        const finalOrder = Object.assign({},
                          {image:productImage},
                          {name:productName},
                          {mainOrderStatus:mainOrderStatus},
                          {totalAmount:totalAmount},
                          {orderId:orderedId},
                          {orderDetails:orderDetails},
                          {address:orderAddress},
                          {coupon:couponData},
                          {paymentMethod:payment} )
                          if(orders){
                            orders.push(finalOrder)
                          }
                         
                    }
                    
                   }

                  
                  
                    
                  res.render("viewOrderDetails",{orders,userData});
                    
             } catch (error) {
                    console.log("Error in loadViewOrderDetails: ",error);
                    next(error)
                    
              }
             
 }

 const deleteOrder = async (req, res, next) => {
  
 try {
  const { orderId, productId, size,quantity,productPrice,discount,paymentMethod } = req.body;
  const userId = req.session.user._id;
 
  

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
   

   if(deletingOrder.modifiedCount===1){
   
    const addingProduct = await product.updateOne(
      { "_id": new objectId(productId), "size.s": { $exists: true } },
      { $inc: { "size.s.quantity": quantity } }
      
    );
   
    if(paymentMethod === 'Razorpay' || paymentMethod === 'wallet'){
      if(discount){
       
        const totalPrice = Math.floor((100-discount)/100*productPrice*quantity);
        
        const data = {
          amount:totalPrice,
          date:new Date(),
          paymentMethod:"Cancell Refund",
          isReceived:true
        
        }
        const updateResult = await wallet.updateOne(
          { userId: new objectId(userId) },
          {
              $push: { walletDatas: data },
              $inc: { balance: totalPrice }
          }
          );
  
      }else{
        
        const data = {
          amount:productPrice * quantity,
          date:new Date(),
          paymentMethod:"Cancell Refund",
          isReceived:true
      }
      const updateResult = await wallet.updateOne(
        { userId: new objectId(userId) },
        {
            $push: { walletDatas: data },
            $inc: { balance: productPrice }
        }
        );

    }}
    
    res.json({success:true})
   }else{
   
    res.json({success:false})
   }
  
 } catch (error) {
  console.error("Error in deleteOrder: ",error);
  next(error);

  
 }
  
  }

  const returnProduct = async(req, res)=>{
      

       try {
            const {orderId, productId, size,quantity, reason, productPrice} = req.body;
            const userId = req.session.user._id
            
          

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
                      "products.$.status": "Return pending",
                      "products.$.returnReason":reason
                  }
              }
          );

         

          if(returnProduct.modifiedCount>0){
          

          res.json({success:true});

          }else{
           
            res.json({success:false})
          }
        
       } catch (error) {
        console.log("Error in returnProduct: ",error);
        next(error);
        
       }
             
  }

  const loadAddressEditCheckout = async(req, res, next)=>{
     
     try {
      const addressId = req.query.addressId;
      
      
    
      const addressData = await user.findOne({_id:req.session.user._id},{"address":{$elemMatch:{_id:new objectId(addressId)}}})
      
       res.render("EditAddressInCheckoutPage",{addressData})
      
     } catch (error) {
      console.error("Error in loadAddAddressInCheckoutPage: ", error);
      next(error);
      
     }
                    
  }

  const updateAddress = async(req, res)=>{
    try {
         
     
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
     
     res.redirect('/proceedToCheckOut')
      
     } catch (error) {
      console.log("Error in updateAddress: ",error);
      next(error);
      
     }

  }
  const verifyPayment = async(req, res, next)=>{
    try {
      const receivedData = req.body.data;
      const userId = req.session.user._id;
  
     
      
      const result = await paymentHelper.verifyThePayment(req.body).then(async (response)=>{
        
         const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId);
              
                if(placedOrder.status === true){
                   
                   const clearedCart = await placeOrderHelper.clearCart(userId);
                   
                   if(clearedCart.acknowledged){
                         
                         res.json({success:true,url:"/orderIsPlaced"});
                   }
                }else{
                  
                  res.json({success:false,message:placedOrder.message,url:"/loadCartPage"})
                 }
         
      }).catch((err)=>{
        res.json({success:false, message:'Payment Failed!!'});
      })
      
    } catch (error) {
      console.log("Error in verifyPayment: ",error);
      next(error);

      
    }

 
  }

  const applyCoupon = async(req, res, next)=>{
           
    try {
      

      
      const {couponId, couponCode, couponName, discount} = req.body
      couponDiscount = parseInt(discount);

      const userId = req.session.user._id;
      
      const cartData = await cart.findOne({userId:new objectId(userId)}).lean();
      const totalAmountofCart = cartData.totalAmount
      

      couponPrice = Math.round(totalAmountofCart - ( totalAmountofCart * couponDiscount/100));
      


      const changeTotalPrice = await cart.updateOne(
                                 {userId:new objectId(userId)},
                                 {$set:{totalAmount:couponPrice}}
      )

      

      if(changeTotalPrice.modifiedCount === 1){
       res.json({success: true, couponPrice})
      }else{
       
       res.json({success:false})
      }
      
    } catch (error) {

      console.log("Error in applyCoupon: ",error);
      next(error);
      

      
    }



  }

  const updateOrderStatus = async(req, res, next)=>{
                        
           try {
                  
            const receivedData = req.body.data;
            const userId = req.session.user._id;
            const orderId = req.body.data.orderId;



const result = await paymentHelper.verifyThePayment(req.body).then(async (response)=>{


const updateOrder = await order.updateOne(
                         {_id:new objectId(orderId)},
                          {$set:{status:"pending"}}          
 );
 
 if(updateOrder.modifiedCount === 1){
   res.json({success:true, url:"/orderIsPlaced"})
 }else{
   res.json({success:false, message:"Order is not Placed!!"}); 
 }

}).catch((err)=>{
res.json({success:false, message:'Payment Failed!!'});
})

            
           } catch (error) {

              console.error("Error in updateOrderStatus: ",error);
              next(error)
           }

  }


  const createOrderFailedPayment = async(req, res)=>{
                     
                       const userId = req.session.user._id
                       const receivedData = req.body

                       const result = await placeOrderHelper.createOrderforFailedPayment(receivedData,userId)
                     
                       if(result.status){
                           const clearedCart = await placeOrderHelper.clearCart(userId);
                            res.json({success:true, url:'/loadPaymentFailurePage'})
                       }


  }

  const loadPaymentFailurePage = async(req, res)=>{
                     

                       res.render("paymentFailurePage")
  }

  const loadAddAddressInCheckoutPage = async(req, res)=>{
                             

                             res.render("addAddressCheckoutPage");
  }

  const saveAddress = async(req, res)=>{
                          
                          

                   try {

                    const userId = req.session.user._id;

                    const   {
                      addresName,addressmobile,housename,pincode,townOrCity,district,state,country,submit
                    }         = req.body;
                    
                    const receivedAddress = {
                      name: addresName,
                      mobile:addressmobile,
                      houseName: housename,
                      pincode: pincode,
                      cityOrTown: townOrCity,
                      district: district,
                      state: state,
                      country: country
                    };

                    const updateUserAdress = await user.updateOne(
                      { _id: userId },
                      { $push: { address: receivedAddress } }
                    );
                
                    
                   res.redirect('/proceedToCheckOut')



                    
                   } catch (error) {
                    console.log("Error in saveAddress",error);
                    next(error);
                    
                   }


  }
  

module.exports = {
  placeOrder,
  loadSuccessPage,
  loadViewOrderDetails,
  deleteOrder,
  returnProduct,
  loadAddressEditCheckout,
  updateAddress,
  verifyPayment,
  applyCoupon,
  createOrderFailedPayment,
  updateOrderStatus,
  loadPaymentFailurePage,
  loadAddAddressInCheckoutPage,
  saveAddress
}