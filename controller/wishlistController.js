const { newOfferPrice } = require("../helper/offerHelper");
const product = require("../models/productModel");
const wishlist = require("../models/wishlistModel");
const user = require("../models/userModel");
const cart = require("../models/cartModel");
const objectId = require("mongoose").Types.ObjectId





const loadWishlistPage = async(req, res, next)=>{
        
         try {

          const userId = new objectId(req.session.user._id)
          const wishlistData = await wishlist.findOne({userId:userId})
          const productArray = [];
          
          if(wishlistData){
            for(pro of wishlistData.products){
              
              wishlistProduct = await product.findOne({_id:new objectId(pro.productId)})
              
              const calculatedPrice = await newOfferPrice(wishlistProduct);
              
              const finalProduct = Object.assign({},wishlistProduct.toObject(),
              {offerPrice:calculatedPrice}
              )
              if(productArray){
                productArray.push(finalProduct)
              }
            }
            
          }else{
            console.log("No product in wishlist data is found!!")
          }
          const userData = await user.findOne({_id:req.session.user._id})
          
          res.render("wishlist",{productArray,userData})
          
         } catch (error) {

          console.log("Error is found in loadwishlistPage: ",error);
          next(error)

          
         }
}



const addToWishlist = async(req, res, next)=>{
       
       
   try {
    const {productId} = req.body
    const userId = new objectId(req.session.user._id);

    const wishlistData = {
                           productId:productId
                         }
   const alredyhaveWishlist = await wishlist.findOne({userId:userId})
   const productAlredyInWishlist = await wishlist.findOne({
     userId:userId,
     products:{
       $elemMatch:{
         productId:productId
       }
     }
   })
 
   if(alredyhaveWishlist && !productAlredyInWishlist){
     
     await wishlist.updateOne({userId:userId},
                            {$push:{products:wishlistData}}
       )
       

       res.json({status:"added",message:"Item is added to wishlist!!"})
   }else if(alredyhaveWishlist && productAlredyInWishlist){
     
     await wishlist.updateOne({userId:userId},
       { $pull: { products: { productId: productId } } }
       )
       
       res.json({status:"removed",message:"Item is removed from wishlist!!"})

   }else{
     
     const createWishlist = await wishlist.create({
       userId:userId,
       products:[wishlistData]

    }) 
    res.json({status:"added",message:"Item is added to wishlist!!"})

   }
   
    
   } catch (error) {
    console.error("Error is found in addtowishlist: ",error);
    next(error)
    
   }
       

}

const deleteWishlist = async(req, res, next)=>{
           
          try {
            
            const {productId} = req.body
            const userId = req.session.user._id
 
            const pullProducts = await wishlist.updateOne({userId:userId},
                                 { $pull: { products: { productId: productId } } }
                                   )
                 
                 if(pullProducts.modifiedCount === 1){
                  res.json({status:true})
                 } else{
                  console.log("Error in deleting product from wishlist");
                 }              
            
          } catch (error) {
            console.error("Error is found in deleteWishlist: ",error);
            next(error);
            
          }   
}

const addToCart = async(req, res, next)=>{
  
   try {
    

    const {size, productId} = req.body;
  
    const userId = req.session.user._id
    const products = await product.findById(productId);
    const offerPrice = await newOfferPrice(products);
    
    const stock = products.size[size].quantity
    
    const productAlredyExistsInCart = await cart.findOne({userId:userId,"items.productId":productId,"items.size":size});
    
  
    const newItem = {
      productId:productId,
      quantity:1,
      price:offerPrice,
      size:size,
      subTotal:offerPrice
     }
  
  
    if (productAlredyExistsInCart) {
  
  res.json({ status: false, message: 'Item is Already in the Cart!!' });
  } else {
  const findCart = await cart.findById(userId);
  
  const updateCart = await cart.updateOne(
  { userId: userId },
  { 
    $setOnInsert: { 
      userId: userId, // Set userId if document is inserted
      createdOn: new Date(), // Set createdOn timestamp if document is inserted
      totalAmount: offerPrice // Set totalAmount to 0 if document is inserted
   },
    $push: { items: newItem } },
    { upsert: true }
  );
  
  
  if(updateCart.upsertedCount === 1){
  res.json({ status: true, url: '/loadCartPage' });
  }
  else if (updateCart.modifiedCount === 1) {
  
  res.json({ status: true, url: '/loadCartPage' });
  } else {
  
  res.json({ status: false, message: 'Failed to add item to the cart' });
  }
  }
    
   } catch (error) {
    console.error(error);
    next(error)
    
   }



}

module.exports = {
             loadWishlistPage,
             addToWishlist,
             deleteWishlist,
             addToCart
          }