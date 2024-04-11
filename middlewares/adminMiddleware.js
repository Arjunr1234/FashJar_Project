




const isAdmin = (req, res, next)=>{
    try{
      if(req.session.admin){
        
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
                        


