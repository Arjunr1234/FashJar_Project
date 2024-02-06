const nodemailer = require("nodemailer");
const { create } = require("../models/userModel");
const User = require("../models/userModel")

function generateSixDigitNumber(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
          service:"gmail",
          auth:{
            user:"arjunreji1234@gmail.com",
            pass:"kart pzsp uisu byzg"
          }

});

const sendOtp = (req,res)=>{
  try {
    const {name,email,mobile,password} = req.body
     
     req.session.insertedData = {name,email,mobile,password};

    const otp = generateSixDigitNumber();
    req.session.otpExpiry = Date.now()+30*1000;
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
      console.log("1st");
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
      const result = await User.create(req.session.insertedData);

      res.redirect('/')
    }
  }else{
    console.log("failed otp verification");
    req.session.otpExpiry = false;
   req.flash( "message","Registration Failed!!")
    res.redirect('/register')
  }
}catch(error){
  console.log(error.message);
}}
const otpHelper = {
  sendOtp,
  verify
}
module.exports = otpHelper;