const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user:{
    type:mongoose.Types.ObjectId,
    ref:"user"
  },
  products:[{
    product:{
      type:mongoose.Types.ObjectId,
      ref:"product"
    },
    quantity:{
      type:Number
    },
    size:{
      type:String
    },
    productPrice:{
      type:Number
    },
    status:{
      type:String,
      enum:["Pending", "Processing", "Confirmed", "OutForDelivery", "Shipped", "Delivery", "Cancelled", "Return pending", "Return", "Returned" ],
      default:"Pending"
    }
  }],
  address:{
    name:String,
    house:String,
    state:String,
    country:String,
    city:String,
    pincode:Number,
    mobile:Number
  },
  paymentMethod:{
    type:String
  },
  orderedOn:{
    type:Date,
    default:Date.now
  },
  deliveredOn:{
    type:Date
    
  },
  status:{
    type:String,
    enum:["pending", "processing", "confirmed", "outForDelivery", "shipped", "delivered", "cancelled", "return Pending", "return"],
    default:"pending"
  },
  orderId:{
    type:Number,
    default:()=>Math.floor(1000+Math.random()*80000),

  },
  totalAmount:{
    type:Number
  }
});

const order = mongoose.model('order', orderSchema);
module.exports = order