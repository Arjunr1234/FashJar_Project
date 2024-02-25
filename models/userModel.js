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

  

})

const User = mongoose.model('User',userSchema)
module.exports = User
