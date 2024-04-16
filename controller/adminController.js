
const admin = require("../models/adminModel");
const fs = require('fs');
const path = require('path');
const User = require("../models/userModel");
const category = require("../models/categoryModel")
const product = require("../models/productModel")
const mongoose = require('mongoose'); 
const order = require("../models/orderModel");
const wallet = require("../models/walletModel");
const objectId = require("mongoose").Types.ObjectId;










const loadLogin =  (req,res, next)=>{
   try {

    const error = req.flash("error")
    res.render("adminLogin",{error})
    
   } catch (error) {
    console.error("Error in loadLogin: ", error);
    next(error)
    
   }
}

const loadHome = async (req, res, next)=>{
   try {

    if(req.session.admin){


      const orderData = await order.aggregate([
                           {$unwind:"$products"},
                           {
                            $group: {
                              _id: "$products.status",
                              count: { $sum: 1 },
                            },
                          },
      ]);
      const currentYear = new Date().getFullYear();
      const monthlyReport = await order.aggregate([
                 {$unwind:"$products"},
                 {
                  $match: {
                    "products.status": "Delivered",
                    $expr: {
                      $eq: [{ $year: "$orderedOn" }, currentYear],
                    },
                  },
                },
                {
                  $group: {
                    _id: { $month: "$orderedOn" },
                    totalAmount: { $sum: "$products.productPrice" },
                  },
                },
                { $sort: { _id: 1 } },
      ]);

      const yearlyReport = await order.aggregate([
        { $unwind: "$products" },
        { $match: { "products.status": "Delivered" } },
        {
          $group: {
            _id: { $year: "$orderedOn" },
            totalAmount: { $sum: "$products.productPrice" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const bestCategory = await order.aggregate([
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "prod",
          },
        },
        { $unwind: "$prod" },
        {
          $lookup: {
            from: "categories",
            localField: "prod.category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]);

      const bestBrand = await order.aggregate([
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "prod",
          },
        },
        { $unwind: "$prod" },
        {
          $group: {
            _id: "$prod.brand",
            count: { $sum: 1 },
          },
        },
      ]);

      const bestSellingProduct = await order.aggregate([
        { $unwind: "$products" },
        { $match: { "products.status": "Delivered" } },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product",
            productName: { $first: "$product.productName" },
            totalCount: { $sum: "$products.quantity" },
            productImage: { $first: "$product.productImage" }
          },
        },
        { $sort: { totalCount: -1 } },
        { $limit: 10 },
      ]);
          
   

      res.render("adminHome",{
        orderData,
        monthlyReport,
        yearlyReport,
        bestCategory,
        bestBrand,
        bestSellingProduct
      })
    }else{
      res.redirect("admin/login")
    }
    
   } catch (error) {
    console.error("Error in loadHome: ", error);
    next(error);
    
   }
}

const loadAdminHome = async (req, res, next)=>{
         
        
         
         
        try {

          const logEmail = req.body.email;
          const logPassword = req.body.password;

           const loggedUser = await admin.findOne({
                       email:logEmail,
                       password:logPassword
           })
           
           if(loggedUser){
             
              req.session.admin = loggedUser._id
              res.redirect("/admin/adminHome")
              
           }
           else{
              
             req.flash("error","Invalid UserId or Password")
              res.redirect("/admin/login")
           }
          
        } catch (error) {
          console.log("Error in loadAdminHome: ",error);
          next(error);
          
        }
}



const loadAdminLogout = (req, res, next)=>{
                 try {

                  if(req.session.admin){
                    req.session.destroy((err)=>{
                       if(err){
                         console.log(err)
                       }else{
                         res.redirect("/admin/login")
                       }
                    })
                 }else{
                   res.redirect("/admin/login")
                 }
                  
                 } catch (error) {
                  console.error("Error in loadAdmininLogout: ", error);
                  next(error)
                  
                 }
            }

 

           const loadCustomerList = async (req, res, next)=>{
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
              console.log("Error in loadCustormelist: ",error);
              next(error);
              
            }            
};

const loadCategoryPage = async (req, res, next) => {
 try {

  if (req.session.admin) {
      
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
  
 } catch (error) {
  console.error("Error in loadCategoryPage; ",error);
  next(error);
  
 }
};


  

  const blockUser = async (req, res, next) => {
    try {
      
      const userId = req.query.id;
      console.log(userId);
      const findUser = await User.findById({ _id: userId });
  
      if (findUser.isActive === true) {
        await User.findByIdAndUpdate({ _id: userId }, { $set: { isActive: false } });
      } else {
        await User.findByIdAndUpdate({ _id: userId }, { $set: { isActive: true } });
      }
  
      res.json({ success: true }); 
    } catch (error) {
      console.log("Error in blockUser: ",error);
      next(error)
    }
  };
  

    const listUnlistCategory = async(req, res, next)=>{
                   try{
                     
                     const catId = req.query.id;
                     console.log(catId);
                     const findCat = await category.findById({_id:catId})
                     console.log(findCat)
                     if(findCat.isListed === true){
                      const catData = await category.findByIdAndUpdate({_id:catId},{$set:{isListed:false}})
                      res.json({success:true})
                      
                     }else{
                      const catData = await category.findByIdAndUpdate({_id:catId},{$set:{isListed:true}})
                      res.json({success:true})
                     }
                    
                   }catch(error){
                    console.log("Error in ulistCategory: ",error);
                    next(error);
                   }

    }
   

  const unblockUser = async (req, res, next)=>{
                     try{
                      const userId = req.query._id;
                      const status = await User.findOne({_id:userId},{$set:{isActive:false}});
                      delete req.session.user
 
                     }catch(error){
                      console.log("Error in unblockUser: ",error);
                      next(error)
                     }
  }

  const addCategory = async (req, res, next) => {
    
    const categoryName = req.body.name;
    
    const checkingName = await category.find({ name: { $regex: new RegExp("^" + categoryName + "$", "i") } });
    
  
    if (checkingName.length === 0) {
      try {
        
  
        const receivedData = req.body;
        
  
        const categoryData = {
          name: receivedData.name,
          description: receivedData.description,
        };
  
        const data = await category.create(categoryData);
        
        req.flash("message", "Added Successfully!!");
        res.redirect("/admin/category");
      } catch (error) {
        console.log(error.message);
        next(error)
      }
    } else {
      req.flash("error", "Category Exists");
      res.redirect("/admin/category");
    }
  

  }

    const loadCategoryEdit = async (req, res, next)=>{
          try {

            const   categoryId = req.query.categoryId
            const   categoryData = await category.findOne({_id:categoryId})
            res.render("categoryEdit",{categoryData})
            
          } catch (error) {
            console.error("Error in loadCategoryEdit: ", error);
            next(error)
            
          }
       }

       const updateCategory = async (req, res, next) => {
        try {
          
          const categoryId = req.query.categoryId;
          const updatedData = req.body;
      
          
      
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
      
          
          res.redirect("/admin/category");
        } catch (error) {
          console.error("Error in updateCategory",error);
          next(error)
        }
      };
      

   const loadProductPage = async (req, res, next)=>{
                    try {

                      const productDetails = await product.aggregate([
                        {
                          $lookup: {
                            from: "categories",
                            localField: "category",
                            foreignField: "_id",
                            as: "newfield"
                          }
                        }
                      ]);
                      let itemsPerPage = 9
                      let currentPage = parseInt(req.query.page) || 1
                      let startIndex = (currentPage-1)* itemsPerPage
                      let endIndex = startIndex + itemsPerPage
                      let totalPages = Math.ceil(productDetails.length/itemsPerPage)
                      const currentProduct = productDetails.slice(startIndex,endIndex);

                      
                     
                      

                      
                       
                       res.render("productPage",{productDetails:currentProduct, totalPages, currentPage})
                      
                    } catch (error) {
                      console.error("Error in loadProductPage: ",error);
                      next(error)
                      
                    }
   }
   

   const loadAddProduct = async (req, res, next)=>{
                       try {

                        const categoryData = await category.find({isListed:true})
                        const message = req.flash("message")
                        res.render("addProduct",{category:categoryData,message})
                       } catch (error) {
                        console.log("error in loadAddproduct: ",error);
                        next(error)
                        
                        
                       }
   }

   const addingProduct = async(req, res, next)=>{
            try { 
              
              
              const dateFormatted = new Date().toISOString().replace(/[-T:.Z]/g, '');
            
              const imageName = [];
              if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    imageName.push(req.files[i].filename); 
                }
            }

              
             console.log(imageName)
             const  receivedproductData = req.body;
             const productData = {
              id:Date.now(),
              productName:receivedproductData.productName,
              brand:receivedproductData.brandName,
              description:receivedproductData.description,
              category:receivedproductData.category,
              regularPrice:receivedproductData.regularPrice,
              discount:receivedproductData.salePrice,
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
              console.log("Error in adding Product: ",error);
              next(error);
              
            }}

   const listUnlistProduct = async(req, res, next)=>{
    try {  
          
          const prodId = req.query.id;
          console.log(prodId);
          const findPrd = await product.findById({_id:prodId});
          if(findPrd.isBlocked === true){
            const productData = await product.findByIdAndUpdate({_id:prodId},{$set:{isBlocked:false}});
            res.json({success:true})
            
          }else{
            const productData = await product.findByIdAndUpdate({_id:prodId},{$set:{isBlocked:true}})
            res.json({success:true})
            
          }
      
    } catch (error) {
      console.log("Error in listUnlistProduct: ",error);
      next(error)
      
    }
  }

  
  const { Types: { ObjectId } } = mongoose;
  
  const loadProductEdit = async (req, res, next) => {
    try {
      
      const productId = req.query.id;
      
  
      // Fetch category data
      const categoryData = await category.find();
      const productData = await product.find({_id:productId})
      const selectedCat = await category.findOne({_id:productData[0].category})
      
      
  
      // Render the product edit page with the fetched data
      res.render("productEdit", { productData, categoryData,selectedCat });
    } catch (error) {
      console.error("Error in loadProductEdit:", error);
      next(error)
    }
  };
  

   

  const editProducts = async (req, res, next) => {
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
            
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        // Update product data
        const productData = {
            productName: receivedproductData.productName,
            brand: receivedproductData.brandName,
            description: receivedproductData.description,
            category: receivedproductData.category,
            regularPrice: receivedproductData.regularPrice,
            discount: receivedproductData.salePrice,
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
            
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        
        
        res.redirect('/admin/products');
    } catch (error) {
        console.error("Error editing product:", error.message);
        next(error)
    }
};

const deleteImage = async(req, res, next)=>{
                  try {

                    
                  
                  const { id, imageName } = req.body;


                  const imagePath = path.join(__dirname, '..', 'public', 'uploads', 'product-images', imageName);

    
    if (fs.existsSync(imagePath)) {
      
      fs.unlinkSync(imagePath);
      
    } else {
      
      return res.status(404).json({ message: "File not found." });
    }
    
    const productData = await product.findByIdAndUpdate(
      { _id: id },
      { $pull: { productImage: imageName } },
      { new: true } 
    );
    
    res.json({message:true})
                    
                  } catch (error) {
                    console.log("Error in deleteImage: ",error);
                    next(error);
                    
                  }

                  
              
}

const loadOrderPage = async (req, res, next)=>{
      
       
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


               let itemsPerPage = 8;
               let currentPage = parseInt(req.query.page) || 1;
               let totalPages = Math.ceil(orderData.length / itemsPerPage);
               let lastPage = totalPages;
               
               
               let startIndex = orderData.length - (currentPage * itemsPerPage);
               let endIndex = startIndex + itemsPerPage;
               if (startIndex < 0) {
                   endIndex += startIndex; 
                   startIndex = 0;
               }
        
               const currentProduct = orderData.slice(startIndex, endIndex);
        
       
             res.render("orderDetails",{orderData:currentProduct, totalPages, currentPage})
        
       } catch (error) {
        console.error("Error in loadOrderPage: ",error);
        next(error);
        
       }

      }

const loadViewOrderPage = async(req, res, next)=>{
                
                
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
                  
                  
                 
                  
                  res.render("viewOrderDetailsAdmin",{orderData});
                  
                  
                } catch (error) {
                  console.log("Error in loadViewOrderPage: ", error);
                  next(error);
                  
                }
              
}      


const changeOrderStatus = async (req, res, next) => {
  

  try {
      const { orderId, productId, productSize, status,productPrice,userId,quantity } = req.body;
      const receivedPrice = parseInt(productPrice);
      const receivedQuantity = parseInt(quantity)
      

     
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
           
          
    

      
      if (changingData.modifiedCount > 0) {

        
        if(status === 'Returned'){
          const totalPrice = receivedPrice * receivedQuantity

          const data = {
            amount:totalPrice,
            date:new Date(),
            paymentMethod:"Return Refund",
            isReceived:true
          
          }
          const updateResult = await wallet.updateOne(
            { userId: new objectId(userId) },
            {
                $push: { walletDatas: data },
                $inc: { balance: totalPrice }
            }
            );
            

        }
        
        res.json({ success: true });
    } else {
        
        res.json({ success: false });
    }
    
  } catch (error) {
      console.error('Error in changing orderStatus:', error);
      next(error);
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