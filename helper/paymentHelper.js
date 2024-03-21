const { rejects } = require("assert");
const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: 'rzp_test_K8JS3lXn50mode',
  key_secret: 'w7TOk0LKBFfCmwIEyPvL0KfN',
});



function generateRazorpay(Id,amount){
  return new Promise((resolve, rejects)=>{
      console.log("This is the Id: ",Id)
    var options = {
      amount: amount,  // amount in the smallest currency unit
      currency: "INR",
      receipt: Id
    };
    instance.orders.create(options, function(err, order) {
      
      resolve(order)
    });
    

  })
}

module.exports = {
          generateRazorpay
}