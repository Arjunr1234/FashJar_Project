const user = require("../models/userModel");


const isUser = async(req, res,next)=>{

  try {

      if(req.session.user){
        const check = await user.findOne({_id:req.session.user},{_id:0,isActive:1})
          console.log("This data in Middleware",check)
          if(check.isActive){
            console.log("user is not blocked");
            next()
          }else{
            console.log("user is blocked")
            req.session.destroy((err)=>{
              if(err){
                console.log("Error in Blocking:",err)

              }
            })
            res.redirect("/");
          }

      }else{
        console.log("Some error is found in userLogging middleware")
        res.redirect('/')
      }
    
  } catch (error) {
    console.log(error)
    
  }
}
module.exports = isUser