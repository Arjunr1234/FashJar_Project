const { render } = require("ejs")
const User = require("../models/userModel")
const otpSend = require("../helper/otpHelper")
const otpHelper = require("../helper/otpHelper")
const userHelper = require("../helper/userHelper")


const loginLoad = function (req, res) {

  if(req.session.user){
    res.redirect("/userHome")
  }else if(req.session.admin){
    res.redirect("/adminHome")
  }else{
    const message=req.flash("message")
    const error=req.flash(error)
    res.render("user/login",{message,error})
  }

}

const loadRegister = function(req, res){
     if(req.session.user){
      res.redirect("/userHome")
     }else if(req.session.admin){
      res.redirect("/adminHome")
     }else{
      const message = req.flash("message")
      const error = req.flash("error")
      res.render("user/register",{error,message})
     }
}


const insertUserWithVerify = async function(req, res) {
  try {
    const sendedOtp = req.session.otp;
    const verifyOtp = req.body.otp;
    console.log(sendedOtp);
    console.log(verifyOtp);
    console.log("start Checking");

    if (sendedOtp === verifyOtp && Date.now() < req.session.otpExpiry) {
      console.log("otp entered before time expires");
      req.session.otpMatched = true;
      console.log("req in insert user");

      const UserData = req.session.insertedData;
      const response = await userHelper.doSignup(UserData, req.session.otpMatched);
      console.log(response)

      if (!response.status) {
        const error = response.message;
        req.flash("message", error);
        return res.redirect("/register");
      } else {
        const message = response.message;
        req.flash("message", message);
        return res.redirect('/');
      }
    } else {
       console.log("failed otp verification");
       req.session.otpExpiry = false;
       req.flash("error", "Registration Failed_failedotp!!");
      return res.redirect('/register');
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/register");
  }
};



const logUser = async function(req,res){
  const logEmail = req.body.email;
  const logPassword = req.body.password;
  try {
    const loggedUser = await User.findOne({
      email:logEmail,
      password:logPassword
    })
    if(loggedUser){
      if(loggedUser.isAdmin === 1){
        req.session.admin = loggedUser._id
        res.redirect("/adminHome")
      }else{
        req.session.user = loggedUser._id
        res.redirect("/userHome")
      }
    }else{
      req.flash("error","Login Failed")
      res.redirect("/")
    }
    
  } catch (error) {

    console.log(error.message);
  }
}

const loadUserHome = async function (req,res){
  try {
    if(req.session.user){
      const userData = await User.findOne({_id:req.session.user});
      const name = userData.name
      res.render("user/userHome",{message:name});
    } else{
      res.redirect("/")
    }

   } catch (error) {
    console.log(error.message)
    
  }
}

const loadLogout = (req,res)=>{
  
  if(req.session.user){
    req.session.destroy((err)=>{
      if(err){
        console.log("Error in login");
      }
      else{
        res.redirect("/")
      }
    })
  }else{
    res.redirect("/")
  }

}

const loadOtpVerify = async function(req,res){
      res.render('user/otpVerify')
}   


// const dataStoreSession = async (req,res)=>{
//      const {name,email,mob,password} = req.body
//      req.session.insertedData = {name,email,mob,password}
    
//      res.redirect('/sendotp')
//      console.log(req.session.insertedData);
//      }


const registerWithOtp = async(req,res)=>{
  try {
        
    
  } catch (error) {
    console.log(error.message)
  }
}
  





   








module.exports = { 
              loginLoad,
              loadRegister,
              insertUserWithVerify,
              logUser,
              loadUserHome,
              loadLogout,
              loadOtpVerify,

              //otp
              
                    }