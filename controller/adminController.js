const session = require("express-session");
const admin = require("../models/adminModel");
const flash = require("express-flash");
const User = require("../models/userModel");
const category = require("../models/categoryModel")
const product = require("../models/productModel")






const loadLogin =  (req,res)=>{
  const error = req.flash("error")
  res.render("adminLogin",{error})
}

const loadHome = (req, res)=>{
    if(req.session.admin){
      res.render("adminHome")
    }else{
      res.redirect("admin/login")
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
             req.flash("error","Invalid UserId or Password")
              res.redirect("/admin/login")
           }
          
        } catch (error) {
          console.log(error);
          
        }
}



const loadAdminLogout = (req, res)=>{
                  if(req.session.admin){
                     req.session.destroy((err)=>{
                        if(err){
                          console.log("Error in logout");
                        }else{
                          res.redirect("/admin/login")
                        }
                     })
                  }else{
                    res.redirect("/admin/login")
                  }
}

 

           const loadCustomerList = async (req, res)=>{
            try {
              
              if(req.session.admin){
                const [adminData, userData] = await Promise.all([
                  (async (req,res)=>{
                    try {return await admin.find({_id:req.session.admin})
                        } catch (error) {
                      console.log(error);
                      } })(req, res),

                  (async (req, res)=>{
                    try{return await User.find() }
                    catch(error){
                      console.log(error)
                    }
                  })(req, res)
                ])
                
                res.render("customerPage",{users:userData})
              }else{
                res.redirect("/admin/adminHome")
              }
              

            } catch (error) {
              console.log(error)
              
            }            
};

const loadCategoryPage = async (req, res) => {
  if (req.session.admin) {
      console.log("Entered into loadCategory");
      try {
          const categoryD = await category.find();
          console.log(category); 
          const error = req.flash("error")
          const message = req.flash("message")
          res.render("catagoryPage", { categoryD,message,error });
          
      } catch (error) {
          console.log(error);
          res.status(500).send("Internal Server Error");
      }
  } else {
      res.redirect("/admin/login");
  }
};


  // const loadCategory = (req, res)=>{
  //    const message = req.flash("message")
  //    res.render("catagoryPage",{message})
  // }

  const blockUser = async(req, res)=>{
              try{
                console.log("Enter to the block user page");
                const userId = req.query.id;
                console.log(userId)
                const findUser = await User.findById({_id:userId});

                if(findUser.isActive === true){
                  const userData = await User.findByIdAndUpdate(
                    {_id:userId},
                    {$set:{isActive:false}
                  });
                }else{
                  const userData = await User.findByIdAndUpdate({_id:userId},
                    {$set:{isActive:true}})
                }
                res.redirect("/admin/customerlist")
              }catch(error){
                console.log(error.message);
              }

  }

    const listUnlistCategory = async(req, res)=>{
                   try{
                     console.log("Entered in to listUnlist catetory")
                     const catId = req.query.id;
                     console.log(catId);
                     const findCat = await category.findById({_id:catId})
                     console.log(findCat)
                     if(findCat.isListed === true){
                      const catData = await category.findByIdAndUpdate({_id:catId},{$set:{isListed:false}})
                      res.json({success:true})
                      console.log("true to false");
                     }else{
                      const catData = await category.findByIdAndUpdate({_id:catId},{$set:{isListed:true}})
                      res.json({success:true})
                     }
                    
                   }catch(error){
                    console.log(error)
                   }

    }

  const unblockUser = async (req, res)=>{
                     try{
                      const userId = req.query._id;
                      const status = await User.findOne({_id:userId},{$set:{isActive:false}});
                      delete req.session.user
 
                     }catch(error){
                      console.log(error.message);
                     }
  }

  const addCategory = async (req, res) => {
    console.log("Entered into addcategory");
    const categoryName = req.body.name;
    console.log(categoryName);
    const checkingName = await category.find({ name: categoryName });
    console.log(checkingName);
  
    if (checkingName.length === 0) {
      try {
        console.log("Enter into try catch");
  
        const receivedData = req.body;
        console.log(receivedData);
  
        const categoryData = {
          name: receivedData.name,
          description: receivedData.description,
        };
  
        const data = await category.create(categoryData);
        console.log("Data is Added to the Database");
        req.flash("message", "Added Successfully!!");
        res.redirect("/admin/category");
      } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
      }
    } else {
      req.flash("error", "Category Exists");
      res.redirect("/admin/category");
    }
  

  }

    const loadCategoryEdit = async (req, res)=>{
           const   categoryId = req.query.categoryId
           const   categoryData = await category.findOne({_id:categoryId})
              res.render("categoryEdit",{categoryData})
       }

       const updateCategory = async (req, res) => {
        try {
          console.log("Entered into updateCategory");
          const categoryId = req.query.categoryId;
          const updatedData = req.body;
      
          console.log("Updated Data:", updatedData);
      
          const categoryData = await category.findByIdAndUpdate(
            { _id: categoryId },
            {
              $set: {
                name: updatedData.categoryName,
                description: updatedData.description
              }
            },
            { new: true } // This option returns the modified document instead of the original
          );
      
          console.log("Updated Data:", categoryData);
          res.redirect("/admin/category");
        } catch (error) {
          console.log(error.message);
          res.status(500).send("Internal Server Error");
        }
      };
      

   const loadProductPage = (req, res)=>{
                       res.render("productPage")
   }
   

   const loadAddProduct = async (req, res)=>{
                       try {

                        const categoryData = await category.find({isListed:true})
                        res.render("addProduct",{category:categoryData})
                       } catch (error) {
                        console.log("error in loadAddproduct: "+error)
                        
                        
                       }
   }

   const addingProduct = async(req, res)=>{
            try { 

              console.log("Entered into adding product");
             
           //  const imageName = req.file && Array.isArray(req.file) ? req.file.map((x) => x.originalname) : [];
               const imageName = req.files.map((x)=>x.originalname)
             console.log(imageName)
             const  receivedproductData = req.body;
             const productData = {
              id:Date.now(),
              productName:receivedproductData.productName,
              brand:receivedproductData.brandName,
              description:receivedproductData.description,
              category:receivedproductData.category,
              regularPrice:receivedproductData.regularPrice,
              salePrice:receivedproductData.salePrice,
              createdOn:Date.now(),
              totalQuantity:receivedproductData.totalQuantity,
              productImage:imageName,
              totalQuantity:receivedproductData.totalQuantity,
              size:{
                s:{
                  quantity:receivedproductData.ssize
                },
                m:{
                  quantity:receivedproductData.msize
                },
                l:{
                  quantity:receivedproductData.lsize
                }
              },
              color:receivedproductData.color
              

             }
             console.log(receivedproductData);

             const storedData = await product.create(productData)
             console.log(storedData);
             res.redirect('/admin/loadAddProduct')

                  
            } catch (error) {
              console.log(error.message);
              
            }


   }



module.exports =  {
                    loadLogin,
                    loadAdminHome,
                    loadHome,
                    loadAdminLogout,
                    loadCustomerList,
                    blockUser,
                    unblockUser,
                    loadCategoryPage,
                    addCategory,
                    listUnlistCategory,
                    loadCategoryEdit,
                    updateCategory,
                    loadProductPage,
                    loadAddProduct,
                    addingProduct
                    
                 }