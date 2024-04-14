const user = require("../models/userModel");


const isUser = async(req, res,next)=>{

  try {
    if (req.session.user) {
      const check = await user.findOne({ _id: req.session.user }, { _id: 0, isActive: 1 });
    
  
      if (check.isActive) {
        
        next();
      } else {
        
        
        delete req.session.user
        res.redirect("/login");
      }
    } else {
      
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
  }
  
}
module.exports = isUser