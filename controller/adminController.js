const session = require("express-session");
const admin = require("../models/adminModel");
const flash = require("express-flash");
const User = require("../models/userModel");
const category = require("../models/categoryModel")
const product = require("../models/productModel")
const mongoose = require('mongoose'); 
const order = require("../models/orderModel");
const cart = require("../models/cartModel");
const objectId = require("mongoose").Types.ObjectId









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

  const blockUser = async (req, res) => {
    try {
      console.log("Enter to the block user page");
      const userId = req.query.id;
      console.log(userId);
      const findUser = await User.findById({ _id: userId });
  
      if (findUser.isActive === true) {
        await User.findByIdAndUpdate({ _id: userId }, { $set: { isActive: false } });
      } else {
        await User.findByIdAndUpdate({ _id: userId }, { $set: { isActive: true } });
      }
  
      res.json({ success: true }); // Send a JSON response
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: error.message }); // Handle errors
    }
  };
  

    const listUnlistCategory = async(req, res)=>{
                   try{
                     console.log("Entered in to listUnlist catetory why entered")
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
    const checkingName = await category.find({ name: { $regex: new RegExp("^" + categoryName + "$", "i") } });
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
      

   const loadProductPage = async (req, res)=>{
                      const productDetails = await product.aggregate([
                        {
                          $lookup: {
                            from: "categories",
                            localField: "category",
                            foreignField: "_id",
                            as: "newfield"
                          }
                        }
                      ])
                      
                      console.log(productDetails)

                      
                       
                       res.render("productPage",{productDetails})
   }
   

   const loadAddProduct = async (req, res)=>{
                       try {

                        const categoryData = await category.find({isListed:true})
                        const message = req.flash("message")
                        res.render("addProduct",{category:categoryData,message})
                       } catch (error) {
                        console.log("error in loadAddproduct: "+error)
                        
                        
                       }
   }

   const addingProduct = async(req, res)=>{
            try { 
              
              console.log("Entered into adding product");
              const dateFormatted = new Date().toISOString().replace(/[-T:.Z]/g, '');
             // const imageName = dateFormatted + '_' + files.originalname;
           //  const imageName = req.file && Array.isArray(req.file) ? req.file.map((x) => x.originalname) : [];
           // const imageName = req.files.map((file) => `${dateFormatted}_${file.originalname}`);
              const imageName = [];
              if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    imageName.push(req.files[i].filename); 
                }
            }

              // const imageName = req.files.map((x)=>x.originalname)
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
             

             const storedData = await product.create(productData)
             
             const message = req.flash("message","Successfully added!!")
             res.redirect('/admin/loadAddProduct')

                  
            } catch (error) {
              console.log(error.message);
              
            }}

   const listUnlistProduct = async(req, res)=>{
    try {  
          console.log("Entered into list unlist of Product");
          const prodId = req.query.id;
          console.log(prodId);
          const findPrd = await product.findById({_id:prodId});
          if(findPrd.isBlocked === true){
            const productData = await product.findByIdAndUpdate({_id:prodId},{$set:{isBlocked:false}});
            res.json({success:true})
            console.log("true to false");
          }else{
            const productData = await product.findByIdAndUpdate({_id:prodId},{$set:{isBlocked:true}})
            res.json({success:true})
            console.log("false to true");
          }
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

  
  const { Types: { ObjectId } } = mongoose;
  
  const loadProductEdit = async (req, res) => {
    try {
      // Extract the product ID from query parameters
      const productId = req.query.id;
      console.log("This is the received id: ", productId);
  
      // Fetch category data
      const categoryData = await category.find();
      const productData = await product.find({_id:productId})
      const selectedCat = await category.findOne({_id:productData[0].category})
      
      console.log("This is the product Data from loadProductedit : ",productData)
  
      console.log("This is the product data from loadProductEdit", productData[0].category);
      
  
      // Render the product edit page with the fetched data
      res.render("productEdit", { productData, categoryData,selectedCat });
    } catch (error) {
      console.error("Error in loadProductEdit:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  

   

  const editProducts = async (req, res) => {
    try {
        const imageName = [];

        // Check if new images are uploaded
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
              const existingProduct = await product.findById(req.query.id);
            if (existingProduct) {
                imageName.push(...existingProduct.productImage);
            }
                imageName.push(req.files[i].filename);
            }
         }
        else {
            // No new images uploaded, preserve existing images
            const existingProduct = await product.findById(req.query.id);
            if (existingProduct) {
                imageName.push(...existingProduct.productImage);
            }
        }

        const productId = req.query.id;
        const receivedproductData = req.body;
        
        

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.log("Invalid product ID");
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        // Update product data
        const productData = {
            productName: receivedproductData.productName,
            brand: receivedproductData.brandName,
            description: receivedproductData.description,
            category: receivedproductData.category,
            regularPrice: receivedproductData.regularPrice,
            salePrice: receivedproductData.salePrice,
            createdOn: Date.now(),
            totalQuantity: receivedproductData.totalQuantity,
            productImage: imageName,
            size: {
                s: {
                    quantity: receivedproductData.ssize,
                },
                m: {
                    quantity: receivedproductData.msize,
                },
                l: {
                    quantity: receivedproductData.lsize,
                },
            },
            color: receivedproductData.color,
        };

        const editedData = await product.findByIdAndUpdate(productId, productData, { new: true });

        if (!editedData) {
            console.log("Product not found");
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        console.log("This is the edited product:", editedData);
        
        res.redirect('/admin/products');
    } catch (error) {
        console.error("Error editing product:", error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteImage = async(req, res)=>{
                  try {

                    console.log("Enter into delete image in adminController");
                  
                  const { id, imageName } = req.body;
    
    const productData = await product.findByIdAndUpdate(
      { _id: id },
      { $pull: { productImage: imageName } },
      { new: true } // Optional: Return the updated document
    );
    
    res.json({message:true})
                    
                  } catch (error) {
                    console.log(error)
                    
                  }

                  
              
}

const loadOrderPage = async (req, res)=>{
      console.log("Entered into loadOrderPage in adminController")
       
       try {
        const orderData = await order.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails"
            }
          },
          {
            $unwind: "$userDetails" // If needed, unwind the array created by the $lookup stage
          },
          {
            $project: {
              "products":1,
              "paymentMethod":1,
              "orderId": 1,
              "status": 1,
              "totalAmount": 1,
              "orderedOn": 1,
              "userDetails.name": 1,
              "userDetails.email": 1,
              "userDetails.mobile": 1,
              "userDetails.address": 1
              // Include other fields as needed
            }
          }
        ]);
        
        
       console.log("This is order Data :",orderData)
        res.render("orderDetails",{orderData})
        
       } catch (error) {
        console.log(error)
        
       }

      }

const loadViewOrderPage = async(req, res)=>{
                console.log("Entered into loadViewOrderPage in adminControll");
                
                try {  
                  const orderId = req.query.orderId;
                  console.log(orderId);

                  
                  const orderData = await order.aggregate([
                    {
                      $match: { _id: new mongoose.Types.ObjectId(orderId) }
                    },
                    {
                      $unwind: "$products"
                    },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "productDetails"
                      }
                    },
                    {
                      $unwind: "$productDetails"
                    },
                    {
                      $project: {
                      _id: 1,
                      address:1,
                      userId: 1,
                      products: 1,
                      paymentMethod: 1,
                      status: 1,
                      totalAmount: 1,
                      orderedOn: 1,
                      orderId: 1,
                      quantity: "$products.quantity", 
                      productImage: "$productDetails.productImage",
                      productName: "$productDetails.productName"
                      }
                    }
                  ]);
                  
                  
                 console.log("This is the checkData :", orderData);
                  
                  res.render("viewOrderDetailsAdmin",{orderData});
                  
                  
                } catch (error) {
                  console.log(error)
                  
                }
              
}      


const changeOrderStatus = async (req, res) => {
  console.log("Entered into changeorderStatus in adminController");

  try {
      const { orderId, productId, productSize, status } = req.body;
      console.log("This is orderId: ", new mongoose.Types.ObjectId(orderId));
      console.log("This is status: ", status);
      console.log("This is productId:",productId)
      console.log("This is productSize: ",productSize)

     
      const changingData = await order.updateOne(
        {
            "_id": new mongoose.Types.ObjectId(orderId),
            "products": {
                $elemMatch: {
                    "product": new mongoose.Types.ObjectId(productId),
                    "size": productSize
                }
            }
        },
        {
            $set: {
                "products.$.status": status
            }
        }
    );
    

      console.log("This is changingData: ", changingData);
      if (changingData.modifiedCount > 0) {
        console.log('Product status updated successfully.');
        res.json({ success: true });
    } else {
        console.log('No matching order or product found.');
        res.json({ success: false });
    }
    
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



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
                    addingProduct,
                    listUnlistProduct,
                    loadProductEdit,
                    editProducts,
                    deleteImage,
                    loadOrderPage,
                    loadViewOrderPage,
                    changeOrderStatus
                    
                 }