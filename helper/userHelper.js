const userModel = require('../models/userModel');
const bycrypt = require("bcrypt");
const { verify } = require('./otpHelper');


const doSignup = (userData, verify)=>{
   return new Promise(async(resolve, reject)=>{
     const userExist = await userModel.findOne({
      $or: [{email:userData.email},{mobile:userData.mobile}],
     })
     const response = {};
     console.log("hello");
      if(!userExist){
        console.log("user not exit");
        console.log(userData.password)

          if(verify){
            console.log("verified");
            try{
              const password = await bycrypt.hash(userData.password,10);
              const userD = {
                name:userData.name,
                email:userData.email,
                mobile:userData.mobile,
                password:password
              }
              
                const data=  await  userModel.create(userD)
             
                response.status = true;
                response.message = "Signedup Successfully";
                resolve(response);
                console.log(data);
              

            }catch(error){
                 console.log(error.message);
            }
          }else{
            response.status = false,
            response.message = "Enter the correct otp"
            resolve(response)
          }
      }else{
        response.status = false;
        response.message = "User already Exists"
        resolve(response)
      }
   })
}

module.exports = {
                    doSignup
                 }