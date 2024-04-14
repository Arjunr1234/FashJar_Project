const user = require("../models/userModel");

const userChecking = async(req, res, next)=>{

   if(req.session.user){
       res.redirect("/userHome")
   }else{
    next()
   }
      
}

module.exports = userChecking;