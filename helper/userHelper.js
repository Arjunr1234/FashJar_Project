const userModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const { verify } = require('./otpHelper');


// const doLoginHome = async (logEmail, logPassword)=>{
//   return new Promise (async (resolve, reject)=>{
//     try{
//     const response = {}
//     const user = await userModel.findOne({email:logEmail})
//     if(user){
//       if(user.isActive){
        
//         bycrypt.compare(logPassword,user.password).then((result)=>{
//                 if(result){
//                   response.user = user;
//                   response.login = true;
//                   resolve(response)
//                 }else{
//                   response.errorMsg = "Invalid email or noresult  Password"
//                   resolve(response)
//                 }
//         })


//       }else{
//         response.errorMsg = "You are Blocked"
//         resolve(response)
//       }
//     }else{
//       response.errorMsg = "Invalid username or fucking password"
//       resolve(response)
//     }
//   }catch(error){
//     console.log(error);
//   }
//   })
// }
const loginHome = (userData) => {
  console.log(userData);
  return new Promise(async (resolve, reject) => {
    try {
      let user = await userModel.findOne({ email: userData.email });
      let response = {};

      if (user) {
        console.log('The user is now at loginhome and found the user');
        console.log(user.isActive);
        if (user.isActive) {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result) {
              console.log(result);
              response.user = user;
              response.login = true;
              console.log(response);
              resolve(response);
            } else {
              response.loginMessage = "Invalid email or password";
              resolve(response);
            }
          });
        } else {
          response.loginMessage = "You are Blocked";
          resolve(response);
        }
      } else {
        response.loginMessage = "Invalid username or password";
        resolve(response);
      }
    } catch (error) {
      console.log(error);
    }
  });
};

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
              const password = await bcrypt.hash(userData.password,10);
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
                    doSignup,
                    loginHome
                    

                 }