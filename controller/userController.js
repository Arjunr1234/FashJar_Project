const { render } = require("ejs")
const User = require("../models/userModel")
const otpSend = require("../helper/otpHelper")
const otpHelper = require("../helper/otpHelper")
const userHelper = require("../helper/userHelper")
const { response } = require("express")
const bcrypt = require("bcrypt")
const product = require("../models/productModel")
const category = require("../models/categoryModel")



const loginLoad = function (req, res) {

  if(req.session.user){
    res.redirect("/userHome")
  }else{
    const message=req.flash("message")
    const error=req.flash("error")
    res.render("userLogin",{message,error})
  }

}



const loadRegister = function(req, res){
     if(req.session.user){
      res.redirect("/userHome")
     }else{
      const message = req.flash("message")
      const error = req.flash("error")
      res.render("register",{error,message})
     }
}


const insertUserWithVerify = async function(req, res) {
  try {
    const resendedOtp = req.session.resendedOtp;
    const sendedOtp = req.session.otp;
    const verifyOtp = req.body.otp;
    console.log(sendedOtp);
    console.log(verifyOtp);
    console.log("start Checking");

    if (sendedOtp === verifyOtp  && Date.now() < req.session.otpExpiry) {
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
       
      req.flash("error", "Enter correct otp");
      return res.redirect('/register');
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/register");
  }
};







const loginHome = async (req, res) => {
  try {
    const response = await userHelper.loginHome(req.body);
    console.log(response)
    if (response.login) {
      req.session.user = response.user;
      //console.log('User logged in successfully:', response.user,);
      console.log("user is login",response)
      res.redirect("/userHome");
    } else {
      //console.log('Login failed:', response.loginMessage);
      //res.render("login", { errorMessage: response.loginMessage });
      console.log("error",response)
      req.flash("error",response.loginMessage)
      res.redirect('/')
    }
  } catch (error) {
    //console.error('Error in loginHome:', error);
      res.status(500).send('Internal Server Error');
  }
};









const loadUserHome = async function (req, res) {
  try {
      if (req.session.user) {
          const userData = await User.findOne({ _id: req.session.user });
          const name = userData.name;

          const productData = await product.aggregate([
              {
                  $match: {
                      "isBlocked": false
                  }
              },
              {
                  $lookup: {
                      from: "categories",
                      localField: "category",
                      foreignField: "_id",
                      as: "newField"
                  }
              }
          ]);
          const categoryData = await category.find({isListed:true})
          

          
          res.render("userHome", { productData,categoryData });
      } else {
          res.redirect("/");
      }
  } catch (error) {
      console.log(error.message);
  }
};


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

const loadOtpVerify = async function(req,res,next){
     
        res.render('otpVerify')
      
}   






  


const loadSample = async (req, res)=>{
  console.log("Entered into loadSample");
  const products  = await product.find({_id:'65cdd01b55d639d38a200df2'})
  
  res.render("sample",{products});
}


const loadVeiwProduct = async(req, res)=>{
        console.log("Entered to the loadview product");
         const productId = req.query.id;
         
         const products =await product.find({_id:productId})
         
         
         
         res.render("productView",{products});

}

const displaySize = async(req, res)=>{
  try {
     console.log("Entered in to display Size")
    if(req.session.user){
      const id = req.params.id;
      const size = req.params.size;
     

      const productData = await product.find({_id:id})
      //console.log("This is product data :" , productData)

      const small = productData[0].size.s.quantity
      const medium = productData[0].size.m.quantity
      const large = productData[0].size.l.quantity
      
      if(size === 's'){
        res.json({message:small})
      }else if(size === 'm'){
        res.json({message:medium})
      }else if(size === 'l'){
        res.json({message:large})
      }

    }else{
      res.json({message:false})
    }
    
  } catch (error) {
    console.log(error)
    
  }
}

   








module.exports = { 
              loadSample,
              loginLoad,
              loadRegister,
              insertUserWithVerify,  
              loadUserHome,
              loadLogout,
              loadOtpVerify,
              loginHome,
              loadVeiwProduct,
              displaySize

              
              
                    }