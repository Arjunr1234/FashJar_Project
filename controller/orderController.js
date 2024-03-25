const order = require('../models/orderModel');
const product = require('../models/productModel')
const placeOrderHelper = require("../helper/placeOrderHelper");
const objectId = require("mongoose").Types.ObjectId;
//const { ObjectId } = require('mongodb');
const user = require("../models/userModel");
const { addingProduct } = require('./adminController');
const wallet = require('../models/walletModel');
const cart = require("../models/cartModel");
const paymentHelper = require("../helper/paymentHelper");
const { findById } = require('../models/adminModel');




 const placeOrder = async(req, res)=>{

            console.log("Entered into placeorder in orderController");
            const receivedData = req.body;
            const userId = req.session.user._id;
            const couponId = receivedData.globalCouponId
            const totalPriceOfCart = parseInt(receivedData.totalPriceOfCart)
            console.log("This is received Data in placedOrder:",receivedData)
            console.log("This is address: ",receivedData.address);
            console.log("This is paymentMethod: ",receivedData.paymentMethod);
            console.log("This is userId in placdOrder:",userId);
            console.log("This is the received couponId: ",couponId);



            if(receivedData.paymentMethod === 'Cash On Delivery'){
              const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId);
              console.log("This is the Promise response received : ",placedOrder);
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

            }else if(receivedData.paymentMethod === 'wallet'){
              //console.log("payment Method is Wallet");

               const walletData = await wallet.findOne({userId:new objectId(req.session.user._id)});
               const walletBalance = parseInt(walletData.balance);
               console.log("This is wallet Balance: ",walletBalance);


               if(totalPriceOfCart > walletBalance){


                 res.json({success:false, message:'Wallet has insufficient fund!!'})


               }else{


                const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId, couponId);
                console.log("This is the Promise response received : ",placedOrder);
                if(placedOrder.status === true){
                   console.log("hello world!!!")
                   const clearedCart = await placeOrderHelper.clearCart(userId);
                   console.log("This is cleared cart:",clearedCart)
                   if(clearedCart.acknowledged){
                         console.log("Entered in to clearCart acknowledged");
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
              console.log("payment method is razor pay");
              const payment = await paymentHelper.generateRazorpay(userId,totalPriceOfCart)
              console.log("This is the response: ",payment);
              res.json({razorpayStatus:true, instance:payment})
              
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
                        const orderAddress = orderData.address;
                        const couponData = orderData.coupon;
                        const payment = orderData.paymentMethod
                      //  console.log("This is the product detais of each products:",productData);
                        const finalOrder = Object.assign({},
                          {image:productImage},
                          {name:productName},
                          {orderId:orderedId},
                          {orderDetails:orderDetails},
                          {address:orderAddress},
                          {coupon:couponData},
                          {paymentMethod:payment} )
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

  const { orderId, productId, size,quantity,productPrice,discount,paymentMethod } = req.body;
  const userId = req.session.user._id;
  console.log("This is orderId: ", orderId);
  console.log("This is product id: ", productId);
  console.log("This is size: ", size);
  console.log("This is the quantity: ",quantity);
  console.log("This is productPrice: ",productPrice);
  console.log("This is discount: ",discount);
  console.log("This is paymentMethod: ",paymentMethod)
  

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

   if(deletingOrder.modifiedCount===1){
    console.log("The order is cancelled!!");
    const addingProduct = await product.updateOne(
      { "_id": new objectId(productId), "size.s": { $exists: true } },
      { $inc: { "size.s.quantity": quantity } }
      
    );
    console.log("This is the adding product: ",addingProduct);
    if(paymentMethod === 'Razorpay' || paymentMethod === 'wallet'){
      if(discount){
        console.log("Product used a coupon")
        const totalPrice = Math.floor((100-discount)/100*productPrice);
        console.log("This is tottal price with discount: ",totalPrice);
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
        console.log("Product not have coupon")
        const data = {
          amount:productPrice,
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
    console.log("The modified count is 0");
    res.json({success:false})
   }
  }

  const returnProduct = async(req, res)=>{
       console.log("Entered in to return Product of orderController");

       try {
            const {orderId, productId, size,quantity, reason, productPrice} = req.body;
            const userId = req.session.user._id
            
            console.log("This is orderId : ",orderId);
            console.log("This is productId: ",productId);
            console.log("This is the size: ",size);
            console.log("This is the quantity: ",quantity);
            console.log("This is the reason : ",reason);
            console.log("This is the productPrice: ",productPrice)

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

          console.log("This is return product:",returnProduct);

          if(returnProduct.modifiedCount>0){
          

          res.json({success:true});

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
  const verifyPayment = async(req, res)=>{
    console.log("Entered into verifyPayment in orderController");

    const receivedData = req.body.data;
    const userId = req.session.user._id;

    console.log("This is the received body: ",req.body);
    console.log("This is the received data: ",receivedData);
    console.log("This is the userId: ", userId)
    
    const result = await paymentHelper.verifyThePayment(req.body).then(async (response)=>{
       console.log("payment is successfull");

       const placedOrder = await placeOrderHelper.placeOrderHelp(receivedData,userId);
              console.log("This is the Promise response received : ",placedOrder);
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
       
    }).catch((err)=>{
      res.json({success:false, message:'Payment Failed!!'});
    })
  }

  const applyCoupon = async(req, res)=>{
           console.log("Enter into applycoupon in orderController");

           const {couponId, couponCode, couponName, discount} = req.body
           couponDiscount = parseInt(discount);

           const userId = req.session.user._id;
           console.log("This is the body: ",req.body)
           const cartData = await cart.findOne({userId:new objectId(userId)}).lean();
           const totalAmountofCart = cartData.totalAmount
           console.log("This is the total amount of cart: ",totalAmountofCart);

           couponPrice = Math.round(totalAmountofCart - ( totalAmountofCart * couponDiscount/100));
           console.log("This is the price after coupon is applied: ", couponPrice)


           const changeTotalPrice = await cart.updateOne(
                                      {userId:new objectId(userId)},
                                      {$set:{totalAmount:couponPrice}}
           )

           console.log("Thsi is Changetotal price Status: ", changeTotalPrice);

           if(changeTotalPrice.modifiedCount === 1){
            res.json({success: true, couponPrice})
           }else{
            console.log("Data is not modified");
            res.json({success:false})
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
  applyCoupon
}