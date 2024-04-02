const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId:{
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
    },
   returnReason: {
          type:String,
          default:null

    }
  }],
  address:{
    addressId:mongoose.Types.ObjectId,
    name:String,
    house:String,
    state:String,
    district:String,
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
    enum:["pending", "processing", "confirmed", "outForDelivery", "shipped", "delivered", "cancelled", "return Pending", "return","payment Failed"],
    default:"pending"
  },
  orderId:{
    type:Number,
    default:()=>Math.floor(1000+Math.random()*80000),

  },
  totalAmount:{
    type:Number
  },
  coupon:{
    couponId:{
      type:mongoose.Types.ObjectId,
          ref:"coupons"
  },
   name:{
    type:String
   },
   code:{
      type:String
   },
   discount:{
    type:Number
   }
  }
});

const order = mongoose.model('order', orderSchema);
module.exports = order