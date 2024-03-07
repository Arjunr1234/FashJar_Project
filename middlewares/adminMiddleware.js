




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


module.exports = 
                isAdmin
                        


