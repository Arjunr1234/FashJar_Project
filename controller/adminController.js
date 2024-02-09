const session = require("express-session");
const admin = require("../models/adminModel");
const flash = require("express-flash");




const loadLogin =  (req,res)=>{
  const error = flash.error
  res.render("adminLogin",{error})
}

const loadHome = (req, res)=>{
    if(req.session.admin){
      res.render("adminHome")
    }else{
      res.redirect("/login")
    }
}

const loadAdminHome = async (req, res)=>{
         console.log('Received POST request to /adminloging');
         const logEmail = req.body.email;
         const logPassword = req.body.password;
         console.log('Email:', logEmail);
         console.log('Password:', logPassword);
        try {
           const loggedUser = await admin.findOne({
                       email:logEmail,
                       password:logPassword
           })
           console.log(loggedUser)
           if(loggedUser){
             console.log("yes there is a logged user")
              req.session.admin = loggedUser._id
              res.redirect("/admin/adminHome")
              
           }
           else{
              console.log("There is no logged user")
            //  req.flash("error","Invalid UserId or Password")
              res.redirect("/login")
           }
          
        } catch (error) {
          console.log(error);
          
        }


}


module.exports =  {
                    loadLogin,
                    loadAdminHome,
                    loadHome
                 }