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
   }//,
  // isAdmin:{
  //   type:Number,
  //   value:0
  // },
  // isVerified:{
  //   type:Number,
  //   value:0
  // }

  

})

const User = mongoose.model('User',userSchema)
module.exports = User
