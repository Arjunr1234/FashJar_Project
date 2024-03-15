const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    ref:"User",
    required:true
  },
  products:[
    {
      productId:{
        type:mongoose.Types.ObjectId,
        ref:"product",
        required:true,

      },
      
    }
  ]
},
{
  timestamps:true
}
);

const wishlist = mongoose.model('wishlist',wishlistSchema)
module.exports = wishlist