const userModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const { verify } = require('./otpHelper');



const loginHome = (userData) => {
  
  return new Promise(async (resolve, reject) => {
    try {
      let user = await userModel.findOne({ email: userData.email });
      let response = {};

      if (user) {
        
        
        if (user.isActive) {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result) {
              
              response.user = user;
              response.login = true;
              
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
     
      if(!userExist){
        
        

          if(verify){
            
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

const checkUserExist = async (req, res, next)=>{
            const enteredEmail = req.body.email
            const enteredPhone = req.body.mobile
            const checkEmail = await userModel.findOne({email:enteredEmail});
            const checkPhone = await userModel.findOne({mobile:enteredPhone});
           
            if(checkEmail){
                    const error = req.flash("error","Email already registred!!")
                    res.redirect("/register")
            }else if(checkPhone){
                   const error = req.flash("error","Phone number alredy registred!!")
                   res.redirect("/register")
            }else{
              next()
            }

}

module.exports = {
                    doSignup,
                    loginHome,
                    checkUserExist
                    

                 }