const { render } = require("ejs")
const User = require("../models/userModel")
const otpSend = require("../helper/otpHelper")
const otpHelper = require("../helper/otpHelper")


const loginLoad = function (req, res) {

  if(req.session.user){
    res.redirect("/userHome")
  }else if(req.session.admin){
    res.redirect("/adminHome")
  }else{
    const message=req.flash("message")
    const error=req.flash("error")
    res.render("user/login",{message,error})
  }

}

const loadRegister = function(req, res){
     if(req.session.user){
      res.redirect("/userHome")
     }else if(req.session.admin){
      res.redirect("/adminHome")
     }else{
     
      res.render("user/register")
     }
}

const insertUser = async function(req, res) {
  try {
    console.log("req in insert user");

    const userIn = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mob,
      password: req.body.password,
    };

  
    const result = await User.create(userIn);

    console.log(result);

    if (result) {
      res.redirect("/otpVerify");
    }
  } catch (error) {
  
    res.redirect("/register");
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
  

// const otp = (req,res)=>{
//   try{
//     res.redirect("/sendotp")
//   }catch(error){
//     console.log(error.message);
//   }
// }



   








module.exports = { 
              loginLoad,
              loadRegister,
              insertUser,
              logUser,
              loadUserHome,
              loadLogout,
              loadOtpVerify,
              //otp
              
                    }