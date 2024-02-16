


const adminIsLogin = (req,res,next)=>{
  if(req.session.admin){
     res.redirect('/admin/adminhome')
}else{
     next();
 }
}

module.exports = adminIsLogin