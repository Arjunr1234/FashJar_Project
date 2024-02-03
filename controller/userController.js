const { render } = require("ejs")
const User = require("../models/userModel")



const loginLoad = function (req, res) {

  if(req.session.user){
    res.redirect("/userHome")
  }else if(req.session.admin){
    res.redirect("/adminHome")
  }else{
    res.render("user/login")
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
      res.redirect("/");
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
      res.render("user/userHome");
    } else{
      res.redirect("/")
    }

   } catch (error) {
    console.log(error.message)
    
  }
}
   








module.exports = { 
              loginLoad,
              loadRegister,
              insertUser,
              logUser,
              loadUserHome
                    }