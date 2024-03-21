const { rejects } = require("assert");
const { resolve } = require("path");
const Razorpay = require("razorpay");
const secretKey = 'w7TOk0LKBFfCmwIEyPvL0KfN'
var instance = new Razorpay({
  key_id: 'rzp_test_K8JS3lXn50mode',
  key_secret: secretKey,
});



function generateRazorpay(Id,amount){
  return new Promise((resolve, rejects)=>{
      console.log("This is the Id: ",Id)
    var options = {
      amount: amount * 100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: Id
    };
    instance.orders.create(options, function(err, order) {
      
      resolve(order)
    });
    

  })
}

function verifyThePayment(body){
        console.log("Entered into paymentHelper in verifyPayment");
        return new Promise((resolve, reject)=>{
          const crypto = require('crypto');
          let hmac = crypto.createHmac('sha256', secretKey);
          hmac.update(body.payment.razorpay_order_id + '|' + body.payment.razorpay_payment_id);
          hmac = hmac.digest('hex');
          if(hmac === body.payment.razorpay_signature ){
            resolve()
           }else{
            reject()
          }

        })


}

module.exports = {
          generateRazorpay,
          verifyThePayment
}