const cart = require("../models/cartModel");
const productModel = require("../models/productModel");
const users = require("../models/userModel");
const order = require("../models/orderModel");
const coupon = require("../models/couponModel")
const offerHelper = require("../helper/offerHelper")
const ObjectId = require("mongoose").Types.ObjectId




const placeOrderHelp = async (body, userId) => {
  console.log("Entered into placeOrder in placeOrderHelper");
  return new Promise(async (resolve, reject) => {
    try {
          const couponId = body.globalCouponId
          const userIdData = new ObjectId(userId)
          
          if(couponId){
            console.log("user has couponId")
            const addingUserToCoupon = await coupon.updateOne(
                                     {_id:new ObjectId(couponId)},
                                     { $push: { "usedByUser": userIdData } }
            )
          }




      const userCart = await cart.findOne({ userId: userId });



      // Check if userCart is not null before proceeding
      if (userCart) {
        const user = await users.findOne({ _id: userId });

        const orderAddress = user.address.find((address) => {
          return address._id.toString() === body.address;
        });

        let response = {};

        for (let item of userCart.items) {
          const product = await productModel.findOne({ _id: item.productId });
          if (product.size[item.size].quantity < item.quantity) {
            response.status = false;
            response.message = `Insufficient Quantity for product ${product.productName} `;
            resolve(response);
            return;
          }
        }

        let products = [];

        for (let i of userCart.items) {
          const productD = await productModel.findById(i.productId);
          const offerPrice = await offerHelper.newOfferPrice(productD)
          products.push({
            product: i.productId,
            productPrice:offerPrice,
            size: i.size,
            quantity: i.quantity,
            
          });

          const changeProductQuantity = await productModel.findOne({
            _id: i.productId,
          });
          changeProductQuantity.size[i.size].quantity -= i.quantity;
          await changeProductQuantity.save();
        }
           

        if(couponId){
          const couponData = await coupon.findById(couponId).lean();
          console.log("This is my couponDAta finded: ",couponData);
          const couponIdData = new Object(couponId)
          const couponName = couponData.name;
          const couponDiscount = couponData.discount;
          const couponCode = couponData.couponCode


          if (userCart && orderAddress) {
            const orderPlacing = await order.create({
              userId: userId,
              products: products,
              address: {
                name: orderAddress.name,
                mobile: orderAddress.mobile,
                house: orderAddress.house,
                city: orderAddress.city,
                state: orderAddress.state,
                pincode: orderAddress.pincode,
                country: orderAddress.country,
              },
              paymentMethod: body.paymentMethod,
              totalAmount: userCart.totalAmount,
              coupon:{
                couponId:couponIdData,
                name:couponName,
                code:couponCode,
                discount:couponDiscount
              }
              
            });
            response.status = true;
            resolve(response);
          }



        }else{


          if (userCart && orderAddress) {
            const orderPlacing = await order.create({
              userId: userId,
              products: products,
              address: {
                name: orderAddress.name,
                mobile: orderAddress.mobile,
                house: orderAddress.house,
                city: orderAddress.city,
                state: orderAddress.state,
                pincode: orderAddress.pincode,
                country: orderAddress.country,
              },
              paymentMethod: body.paymentMethod,
              totalAmount: userCart.totalAmount
            });
            response.status = true;
            resolve(response);
          }

        }



      
      } else {
        // Handle the case where userCart is null
        console.error("User cart not found for userId:", userId);
        resolve({ status: false, message: "User cart not found" });
      }
    } catch (error) {
      console.log(error);
      reject(error); // Reject the promise with the error
    }
  });
}

  const clearCart = async(userId)=>{
    console.log("Entered into clearCart of placeOrderHelper");
    return new Promise(async(resolve, reject)=>{
      try {
        const result = await cart.deleteOne({userId:userId});
        resolve(result);
        
      } catch (error) {
        console.log(error)
        
      }
    })

  }

module.exports = {
  placeOrderHelp,
  clearCart
}