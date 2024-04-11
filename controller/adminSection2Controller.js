
const mongoose = require('mongoose'); 
const order = require("../models/orderModel");
const admin = require("../models/adminModel");
const User = require("../models/userModel");
const category = require("../models/categoryModel")
const product = require("../models/productModel");
const categoryOffer = require("../models/categoryOfferModel");
const productOffer = require("../models/productOfferModel");
const CategoryOfferModel = require("../models/categoryOfferModel");
const wallet = require("../models/walletModel");
const coupon = require("../models/couponModel");
const ObjectId = require("mongoose").Types.ObjectId


//====Towards the offersection adminSection2 is the controller=============================



const loadCategoryOfferPage = async(req, res)=>{
 

  const categoryOfferData = await CategoryOfferModel.aggregate([
    {
      $lookup: {
        from: "categories", // The collection to perform the lookup on
        localField: "categoryOffer.category", // The field in the current collection
        foreignField: "_id", // The field in the other collection
        as: "categoryDetails" // The alias for the joined data
      }
    },
    {
      $unwind: "$categoryDetails" // Unwind the joined data array
    }
  ])
 
     
  res.render("categoryOffer",{categoryOfferData})
   

                     
}

const loadProductOfferPage = async(req, res)=>{


  const productOfferData = await productOffer.aggregate([
    {
      $lookup: {
        from: "products", // The collection to perform the lookup on
        localField: "productOffer.product", // The field in the current collection
        foreignField: "_id", // The field in the other collection
        as: "productDetails" // The alias for the joined data
      }
    },
    {
      $unwind: "$productDetails" // Unwind the joined data array
    },
    {
      $project: {
        "_id": 1, 
        "name": 1, 
        "startingDate": 1, 
        "endingDate": 1, 
        "productOffer": 1, 
        "productDetails.id": 1, 
        "productDetails.brand": 1,
        "productDetails.productName": 1, 
        
      }
    }
  ])
 
  res.render("productOffer",{productOfferData});
}
const loadAddProductOffer = async(req, res)=>{
 
  const productData = await product.find({},{productName:1}).lean();
  

  for (let i = 0; i < productData.length; i++) {
    const productId = productData[i]._id;
    
    const offer = await productOffer.findOne({ 'productOffer.product': productId });

    if (offer) {
      
        productData[i].offerStatus = true
    } else {
      
        productData[i].offerStatus = false
    }
}

  res.render("addProductOffer",{productData});
}
const loadAddCategoryOffer = async(req, res)=>{
  
  const categoryData = await category.find({}, { name: 1 }).lean();
 

    for (let i = 0; i < categoryData.length; i++) {
    const categoryId = categoryData[i]._id;
    
    // Check if there's an offer for the current category
    const offer = await categoryOffer.findOne({ 'categoryOffer.category': categoryId });

    if (offer) {
        
        categoryData[i].offerStatus = true
    } else {
        
        categoryData[i].offerStatus = false;
    }
}




  res.render("addCategoryOffer",{categoryData})
}

const addingProductOffer = async (req, res) => {
  
  
  
  try {
    
    const { name, startingDate, endingDate, product, categoryDiscount } = req.body;
    
    
    let discount = parseFloat(categoryDiscount);
    
    
    if (isNaN(discount)) {
      throw new Error('Invalid discount value');
    }

   
    const newProductOffer = new productOffer({
      name,
      startingDate,
      endingDate,
      productOffer: {
        product,
        discount,
      },
    });

    // Save the new product offer to the database
    await newProductOffer.save();
    res.redirect("/admin/loadAddProductOffer")
   // res.status(201).json({ message: 'Product offer created successfully' });
  } catch (error) {
    console.error('Error saving product offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const addCategoryOffer = async (req, res) => {
 
  
  
  try {
    // Extract data from the request body
    const { name, startingDate, endingDate, category, categoryDiscount } = req.body;
    
    // Convert category discount to a number
    let discount = parseFloat(categoryDiscount);
    
    // Check if discount is a valid number
    if (isNaN(discount)) {
      throw new Error('Invalid category discount value');
    }

    // Create a new category offer instance
    const newCategoryOffer = new CategoryOfferModel({
      name,
      startingDate,
      endingDate,
      categoryOffer: {
        category,
        discount,
      },
    });

    // Save the new category offer to the database
    await newCategoryOffer.save();
    res.redirect("/admin/loadAddCategoryOffer")
    //res.status(201).json({ message: 'Category offer created successfully' });
  } catch (error) {
    console.error('Error saving category offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProductOffer = async(req, res)=>{
        

        const offerId = new ObjectId(req.query.id);
      

        const deleteOffer = await productOffer.deleteOne({_id:offerId})
         
         if(deleteOffer.deletedCount === 1){
          res.json({success:true})
         }

}
const deleteCategoryOffer = async(req, res)=>{
                           

                           const offerId = new ObjectId(req.query.catOfferId);
                           
                           const deleteOffer = await categoryOffer.deleteOne({_id:offerId})
                           console.log(deleteOffer)
                           if(deleteOffer.deletedCount === 1){
                           res.json({success:true})
                          }

}

const loadEditProductOffer = async (req, res)=>{
  
  const offerId = req.query.id;
  const receivedProductId = req.query.prdId;
 
  
  const prdOfferData = await productOffer.findById(offerId).lean();
  const productData = await product.find({},{productName:1}).lean();
  const thatProduct = await product.findById(receivedProductId).lean()
  const name = thatProduct.productName
  prdOfferData.productOffer.productName = name;

  

  for (let i = 0; i < productData.length; i++) {
    const productId = productData[i]._id;
    
    const offer = await productOffer.findOne({ 'productOffer.product': productId });

    if (offer) {
       if(productData[i]._id.toString() === receivedProductId.toString()){
           
          
          
           productData[i].offerStatus = false
       }else{
           productData[i].offerStatus = true
       }
        
    } else {
      
        productData[i].offerStatus = false
    }
}
 

  res.render("editProductOffer",{prdOfferData, productData})

}
const loadEditCategoryOffer = async(req, res)=>{
  

  const categoryData = await category.find({}, { name: 1 }).lean();
  
  const offerId = req.query.id;
  const receivedCatId = req.query.catId
  const offerDetails = await categoryOffer.findById(offerId).lean()
  const thatCategory = await category.findById(receivedCatId).lean()
  const name = thatCategory.name;
  offerDetails.categoryOffer.categoryName = name;
  
 

  for (let i = 0; i < categoryData.length; i++) {
  const categoryId = categoryData[i]._id;
  
  // Check if there's an offer for the current category
  const offer = await categoryOffer.findOne({ 'categoryOffer.category': categoryId });

  if (offer) {
      if(categoryData[i]._id.toString() === receivedCatId.toString()){
        categoryData[i].offerStatus = false;
      }else{
        categoryData[i].offerStatus = true
      }
     
  } else {
      
      categoryData[i].offerStatus = false;
  }
}

  res.render("editCategoryOffer",{categoryData, offerDetails})
}

const updateProductOffer = async(req, res)=>{
  
  const offerId = req.query.offerId
  
  const { name, startingDate, endingDate, product, discount } = req.body
  

  const updateOffer = await productOffer.updateOne(
                                            {_id:new ObjectId(offerId)},
                                            {
                                              $set: {
                                                "name": name,
                                                "startingDate": new Date(startingDate), 
                                                "endingDate": new Date(endingDate), 
                                                "productOffer.discount": discount,
                                                "productOffer.product": new ObjectId(product)
                                              }
                                            }
                                            )
                     
                  if(updateOffer.modifiedCount === 1){
                    res.redirect('/admin/loadProductOffer')
                  }else{
                    console.log("offer is not updated")
                    res.redirect("/admin/loadProductOffer")
                  }                    
}
const updateCategoryOffer = async(req, res)=>{

  
  
  const offerId = req.query.catId
  const {name, startingDate, endingDate, category, categoryDiscount} = req.body;

  const updateOffer = await categoryOffer.updateOne(
    {_id:new ObjectId(offerId)},
    {
      $set: {
        "name": name,
        "startingDate": new Date(startingDate), 
        "endingDate": new Date(endingDate), 
        "categoryOffer.discount": categoryDiscount,
        "categoryOffer.category": new ObjectId(category)
      }
    }
    )

                       if(updateOffer.modifiedCount === 1){
                       res.redirect('/admin/loadCategoryOffer')
                       }else{

                       console.log("offer is not updated")
                       res.redirect("/admin/loadCategoryOffer")
                       }      
}

const loadCouponPage = async(req, res)=>{
     

     const couponData = await coupon.find()
     

     res.render("couponPage",{couponData})
}

const createCoupons = async(req, res)=>{
  

  
  const { couponName,startingDate,endingDate,couponDiscount } = req.body;
  const startDate = new Date(startingDate);
  const endDate = new Date(endingDate);

               const createCoupon =  await coupon.create({
                            name: couponName,
                            createdOn: startDate,
                            expireOn: endDate,
                            discount: parseInt(couponDiscount),

                                          })
                                          

            res.redirect('/admin/loadCouponPage')
}

const loadCouponEdit = async(req, res)=>{
                      
                      const  couponId = req.query.couponId
                      
                      const couponData = await coupon.findById(couponId)
                      
                      res.render('couponEdit',{couponData})
}

const updateCoupon = async(req, res)=>{
              
               
               const couponId = req.query.couponId;
               const { couponName,startingDate,endingDate,couponDiscount } = req.body;
               const startDate = new Date(startingDate);
               const endDate = new Date(endingDate);
               

               const update = await coupon.updateOne(
                                 {_id:couponId},
                                {$set:{
                                  name: couponName,
                                  createdOn: startDate,
                                  expireOn: endDate,
                                  discount: parseInt(couponDiscount),
                                }}
               )
               res.redirect("/admin/loadCouponPage")
             
}

const deleteCoupon = async(req, res)=>{
                 
                     
                     const couponId = new ObjectId(req.body.id);
                     
                     const couponDelete = await coupon.deleteOne({_id:couponId});
                     
                     if(couponDelete.deletedCount){
                      res.json({success:true});
                     }else{
                      res.json({success:false})
                     }


}





module.exports = {
  loadCategoryOfferPage,
  loadProductOfferPage,
  loadAddProductOffer,
  loadAddCategoryOffer,
  addingProductOffer,
  addCategoryOffer,
  deleteProductOffer,
  loadEditProductOffer,
  loadEditCategoryOffer,
  updateProductOffer,
  updateCategoryOffer,
  deleteCategoryOffer,
  loadCouponPage,
  createCoupons,
  loadCouponEdit,
  updateCoupon,
  deleteCoupon
  
}