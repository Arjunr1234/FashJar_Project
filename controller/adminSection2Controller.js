
const mongoose = require('mongoose'); 
const order = require("../models/orderModel");
const admin = require("../models/adminModel");
const User = require("../models/userModel");
const category = require("../models/categoryModel")
const product = require("../models/productModel");
const categoryOffer = require("../models/categoryOfferModel");
const productOffer = require("../models/productOfferModel");
const CategoryOfferModel = require("../models/categoryOfferModel")


//====Towards the offersection adminSection2 is the controller=============================



const loadCategoryOfferPage = async(req, res)=>{
  console.log("Entered into loadCatergoryofferPage in adminsection2Controller");

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
  console.log("This is the data: ",categoryOfferData);
     
  res.render("categoryOffer",{categoryOfferData})
   

                     
}

const loadProductOfferPage = async(req, res)=>{
  console.log("Entered into loadProductOfferPage in adminsection2Controller");

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
        "_id": 1, // Include the original _id field
        "name": 1, // Include the original name field
        "startingDate": 1, // Include the original startingDate field
        "endingDate": 1, // Include the original endingDate field
        "productOffer": 1, // Include the original productOffer field
        "productDetails.id": 1, // Include the id field from productDetails
        "productDetails.brand": 1, // Include the brand field from productDetails
        "productDetails.productName": 1, // Include the productName field from productDetails
        // Include other fields from productDetails as needed
      }
    }
  ])
  console.log("Thsi si the data : ",productOfferData)
  res.render("productOffer",{productOfferData});
}
const loadAddProductOffer = async(req, res)=>{
  console.log("Entered into loadAddProductOffer in adminsection2Controller");
  const productData = await product.find({},{productName:1});
  console.log("This is the productData sended to AddProductOffer: ",productData)
  res.render("addProductOffer",{productData});
}
const loadAddCategoryOffer = async(req, res)=>{
  console.log("Entered into loadAddCategoryOffer in adminSection2Controller");
  const categoryData = await category.find({},{name:1})
  res.render("addCategoryOffer",{categoryData})
}

const addingProductOffer = async (req, res) => {
  console.log("Entered into adding productOffer in adminSection2Controller");
  console.log("This is the data: ", req.body);
  
  try {
    // Extract data from the request body
    const { name, startingDate, endingDate, product, categoryDiscount } = req.body;
    
    // Convert discount to a number
    let discount = parseFloat(categoryDiscount);
    
    // Check if discount is a valid number
    if (isNaN(discount)) {
      throw new Error('Invalid discount value');
    }

    // Create a new product offer instance
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
  console.log("Entered into adding category offer in adminSection2Controller");
  console.log("This is the data: ", req.body);
  
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


module.exports = {
  loadCategoryOfferPage,
  loadProductOfferPage,
  loadAddProductOffer,
  loadAddCategoryOffer,
  addingProductOffer,
  addCategoryOffer
  
}