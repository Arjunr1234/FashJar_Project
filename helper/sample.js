const userModel = require("../models/userModel")
const bycrypt = require("bcr")



const doSignup = (userData, verify, emailVerify)=>{
  return new Promise(async(resolve,reject)=>{
    const userExist = await userModel.findOne({email:userData.email});
    let response = {}

    if(user){
      console.log('The user is now at loginHome and finded the user')
    }
  })
}