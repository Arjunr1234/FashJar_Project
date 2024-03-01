const mongoose = require("mongoose");
const cartSchema = mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    require:true
  },
  items:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"product",
      require:true
    },
    quantity:{type:Number, default:1},
    price:{type:Number, required:true},
    size:{type:String, required:true}
  }],
  createdOn:{type:Date, default:Date.now},
  totalAmount:{
    type:Number
  }
});
const cart = mongoose.model("cart",cartSchema);
module.exports = cart;
