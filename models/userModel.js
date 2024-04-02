const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  mobile:{
    type:Number,
    required:true
  },
  password:{
    type:String,
    required:true
   },
   refferalCode: {
    type: String,
    uppercase: true,
    unique: true,
    default: generateCouponCode,
  },
   address:[{
    name:{type:String},
    mobile:{type:Number},
    houseName:{type:String},
    pincode:{type:Number},
    cityOrTown:{type:String},
    district:{type:String},
    state:{type:String},
    country:{type:String}
   }],
   isActive:{
    type:Boolean,
    default:true
   }

  

});

function generateCouponCode() {
  const length = 8;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let couponCode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters.charAt(randomIndex);
  }
  return couponCode;
}

const User = mongoose.model('User',userSchema)
module.exports = User
