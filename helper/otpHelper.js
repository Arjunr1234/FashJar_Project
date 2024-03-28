const nodemailer = require("nodemailer");
const { create } = require("../models/userModel");
const User = require("../models/userModel");
require('dotenv').config();

function generateSixDigitNumber(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
          service:"gmail",
          auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
          }

});


const sendOtp = (req,res)=>{
  try {    
    const {name,email,mobile,password} = req.body
     
     req.session.insertedData = {name,email,mobile,password};
     console.log(req.session.insertedData)
     req.session.storedEmail = email
    const otp = generateSixDigitNumber();
    const expiryTime = 60
    req.session.otpExpiry = Date.now()+expiryTime*1000;
    console.log("generate otp: "+otp);
    const userEmail = email;
    console.log("This is the user email: " + userEmail);

    if(!userEmail){
      return res.status(400).json({error:"Error or Invalid Email"});
    }
    const mailOptions = {
      from:"arjunreji1234@gmail.com",
      to:userEmail,
      subject:"Your OTP Verification Code",
      text:`Your otp is ${otp}`
    }
   
    transporter.sendMail(mailOptions,(error)=>{
     
      if(error){
        console.log(error);
        return res.status(500).json({error:"Error sending OTP email"});
      }
      console.log("otp sended to the user email");
    });
    console.log("2");
    req.session.otp = otp;
   // res.json({message:"OTP Sent to Your Email, Check it!!!"});
    res.redirect('/sendotp');
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({error:"Internal Server Error"});
    
  }
 
};


const resendOtp = (req,res)=>{
  try {    
    
     
     const userEmail =  req.session.storedEmail 
    const otp = generateSixDigitNumber();
    const expiryTime = 60
    req.session.otpExpiry = Date.now()+expiryTime*1000;
    console.log("resended generate otp: "+otp);
    
    console.log("This is the user email: " + userEmail);

    if(!userEmail){
      return res.status(400).json({error:"Error or Invalid Email"});
    }
    const mailOptions = {
      from:"arjunreji1234@gmail.com",
      to:userEmail,
      subject:"Your OTP Verification Code",
      text:`Your otp is ${otp}`
    }
   
    transporter.sendMail(mailOptions,(error)=>{
      console.log("1st");
      if(error){
        console.log(error);
        return res.status(500).json({error:"Error sending OTP email"});
      }else{
        console.log("otp sended to the user email");
      }
      
    });
    console.log("2");
    req.session.otp = otp;
   // res.json({message:"OTP Sent to Your Email, Check it!!!"});
    res.redirect('/sendotp');
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({error:"Internal Server Error"});
    
  }
 
};



const verify = async (req, res )=>{
  try{
  const sendedOtp = req.session.otp;
  const verifyOtp = req.body.otp;
  console.log(sendedOtp);
  console.log(verifyOtp);
  console.log("start Checking");

  if(sendedOtp === verifyOtp){
    if(Date.now()<req.session.otpExpiry){
      console.log("otp entered before time expires");
      req.session.otpMatched = true;
      req.flash("message","Successfully Registred")
      //const result = await User.create(req.session.insertedData);



      res.redirect('/')
    }
  }else{
    console.log("failed otp verification");
    req.session.otpExpiry = false;
   req.flash( "error","Registration Failed!!")
    res.redirect('/register')
  }
}catch(error){
  console.log(error.message);
}}

const verifyOtpForgotPassword = async (req, res )=>{
  try{
  const sendedOtp = req.session.otp;
  const verifyOtp = req.body.otp;
  console.log("This is sendedotp: ",sendedOtp);
  console.log("This is verifyOtp: ",verifyOtp);
  console.log("start Checking");

  if(sendedOtp === verifyOtp){
    if(Date.now()<req.session.otpExpiry){
      console.log("otp entered before time expires");
      req.session.otpMatched = true;
    



      res.redirect('/verify-otp-forgotPassword')
    }
  }else{
    console.log("failed otp verification");
    req.session.otpExpiry = false;
   req.flash( "error","Invalid otp!!")
   res.redirect('/postEmailData')
  }
}catch(error){
  console.log(error.message);
}}


const sendOtpForgotPassword = (email)=>{
               console.log("Entered into sendOtpForgotPassword ");
               
              
             

               return new Promise((resolve, reject)=>{

                const otp = generateSixDigitNumber();
                console.log("This is the email: ",email);
                console.log("This is the otp : ",otp);
               
               
 
                const mailOptions = {
                 from:"arjunreji1234@gmail.com",
                 to:email,
                 subject:"Your OTP Verification Code",
                 text:`Your otp is ${otp}`
               }
 
               transporter.sendMail(mailOptions,(error)=>{
      
                 if(error){
                   console.log(error);
                   return res.status(500).json({error:"Error sending OTP email"});
                 }
                 console.log("otp sended to the user email");
               });
               resolve({status:true,otp:otp})
               
                     


               })


}









const otpHelper = {
  sendOtp,
  verify,
  resendOtp,
  sendOtpForgotPassword,
  verifyOtpForgotPassword,
  
  
}
module.exports = otpHelper;