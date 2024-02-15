




const isAdmin = (req, res, next)=>{
    try{
      if(req.session.admin){
        console.log("is admin is verified");
        next()
      }else{
        console.log("some error is found in adminmiddleware");
        res.redirect("/admin/login")
      }
    }catch(error){
      console.log(error.message);
    }
}
// const adminIsLogged = (req, res, next)=>{
//          if(req.session.admin){
//           res.redirect('/admin/adminhome')
//          }
// }

module.exports = 
                isAdmin
                        


// const adminIsLogin = (req,res,next)=>{
//   if(req.session.admin){
//       res.redirect('/admin/adminhome')
//   }else{
//       next();
//   }
// }
// const  adminLogged = (req,res,next)=>{
//   if (req.session.admin) {
//       next()
//   }else{
//       res.redirect('/admin')
//   }
// }


// const adminAuth = {
//   adminIsLogin,
//   adminLogged
// }


//module.exports= adminAuth