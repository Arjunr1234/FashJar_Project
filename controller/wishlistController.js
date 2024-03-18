const { newOfferPrice } = require("../helper/offerHelper");
const { findOne } = require("../models/adminModel");
const product = require("../models/productModel");
const wishlist = require("../models/wishlistModel");
const user = require("../models/userModel");
const cart = require("../models/cartModel")
const objectId = require("mongoose").Types.ObjectId





const loadWishlistPage = async(req, res)=>{
          console.log("Entered into loadWishlistPage in wishlistController")

          const wishlistData = await wishlist.findOne()
          const productArray = [];
          console.log("This is wishlist data: ",wishlistData)
          if(wishlistData){
            for(pro of wishlistData.products){
              console.log("This is products: ",pro)
              wishlistProduct = await product.findOne({_id:pro.productId})
              console.log("This is each product:",wishlistProduct )
              const calculatedPrice = await newOfferPrice(wishlistProduct);
              console.log("This is calculated offerPrice: ",calculatedPrice);
              const finalProduct = Object.assign({},wishlistProduct.toObject(),
              {offerPrice:calculatedPrice}
              )
              if(productArray){
                productArray.push(finalProduct)
              }
            }
            console.log("This is the array :",productArray)
          }else{
            console.log("No product in wishlist data is found!!")
          }
          const userData = await user.findOne({_id:req.session.user._id})
          
          res.render("wishlist",{productArray,userData})
}



const addToWishlist = async(req, res)=>{
       console.log("Entered into addtowishlist in wishlistcontroller");
       
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
      console.log("This is alredy have wishlist: ",alredyhaveWishlist);
      console.log("product is alredy in the wishlist : ",productAlredyInWishlist);
      if(alredyhaveWishlist && !productAlredyInWishlist){
        console.log("user alredy have a wishlist!!! the push the product")
        await wishlist.updateOne({userId:userId},
                               {$push:{products:wishlistData}}
          )
          console.log("Item is pushed")

          res.json({status:"added",message:"Item is added to wishlist!!"})
      }else if(alredyhaveWishlist && productAlredyInWishlist){
        console.log("product is alredy in the wishlist please remove it");
        await wishlist.updateOne({userId:userId},
          { $pull: { products: { productId: productId } } }
          )
          console.log("Item is pulled");
          res.json({status:"removed",message:"Item is removed from wishlist!!"})

      }else{
        console.log("new usesr wish list is created");
        const createWishlist = await wishlist.create({
          userId:userId,
          products:[wishlistData]

       }) 
       res.json({status:"added",message:"Item is added to wishlist!!"})

      }
      
       

}

const deleteWishlist = async(req, res)=>{
           console.log("Entered into delete wishlist of wishlist controller")
          try {
            const {productId} = req.body
            const userId = req.session.user._id
 
            const pullProducts = await wishlist.updateOne({userId:userId},
                                 { $pull: { products: { productId: productId } } }
                                   )
                 console.log(pullProducts);
                 if(pullProducts.modifiedCount === 1){
                  res.json({status:true})
                 } else{
                  console.log("Error in deleting product from wishlist");
                 }              
            
          } catch (error) {
            console.log(error)
            
          }   
}

const addToCart = async(req, res)=>{
            console.log("Entered into addto cart in wishlistController");
            const {size, productId} = req.body;
            console.log("This is productId : ",productId);
            console.log("This is size : ",size);
            const userId = req.session.user._id
            const products = await product.findById(productId);
            const offerPrice = await newOfferPrice(products);
            
            const stock = products.size[size].quantity
            console.log("This is the avaliable stock: ",stock)
            const productAlredyExistsInCart = await cart.findOne({userId:userId,"items.productId":productId,"items.size":size});
            console.log("This is the status of productAlreadyExists : ",productAlredyExistsInCart);

            const newItem = {
              productId:productId,
              quantity:1,
              price:offerPrice,
              size:size,
              subTotal:offerPrice
             }


            if (productAlredyExistsInCart) {
    console.log("Product is already in the cart");
    res.json({ status: false, message: 'Item is Already in the Cart!!' });
} else {
    const updateCart = await cart.updateOne(
        { userId: userId },
        { $push: { items: newItem } }
    );
    
    if (updateCart.modifiedCount === 1) {
        console.log("The item is pushed to cart");
        res.json({ status: true, url: '/loadCartPage' });
    } else {
        console.log("Failed to push item to cart");
        res.json({ status: false, message: 'Failed to add item to the cart' });
    }
}



}

module.exports = {
             loadWishlistPage,
             addToWishlist,
             deleteWishlist,
             addToCart
}