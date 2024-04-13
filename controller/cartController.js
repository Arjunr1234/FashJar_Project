const product = require("../models/productModel")
const user = require("../models/userModel")
const cart = require("../models/cartModel")
const offerHelper = require("../helper/offerHelper")
const ObjectId = require("mongoose").Types.ObjectId

const coupon = require("../models/couponModel");



const loadCartPage = async (req, res, next) => {
  try {
    
    const userData = req.session.user
    if (req.session.user) {
      const userId = req.session.user._id;
      const userCart = await cart.findOne({ userId: userId }).lean();
      
      let products = [];

      if (userCart) {
        for (let i = 0; i < userCart.items.length; i++) {
          const cartProduct = await product.findById(userCart.items[i].productId); 
          
          const calculatedPrice = await offerHelper.newOfferPrice(cartProduct)
          const size = userCart.items[i].size;
          const sizeQuantity = cartProduct.size[size].quantity
          const quantity = userCart.items[i].quantity;
          const newSubtotal = quantity*calculatedPrice;
          const subtotal = userCart.items[i].subTotal
          const totalAmoutCart = userCart.totalAmount
          const finalProduct = Object.assign({}, cartProduct.toObject(),
           {size: size},
          {userId:userId },
          {stock:sizeQuantity},
          {subTotal:subtotal},
          {newSubtotal:newSubtotal},
          {totalAmoutCart:totalAmoutCart},
          {offerPrice:calculatedPrice},
          { quantity: quantity })
          if (products) {
            products.push(finalProduct)
          }
        }
        const cartData = await cart.findOne({userId:userId})
             var TotalPriceOfCart = 0
        for(let i=0;i<cartData.items.length;i++){
            const productD = await product.findById(cartData.items[i].productId) 
            const price = await offerHelper.newOfferPrice(productD)
             TotalPriceOfCart = TotalPriceOfCart +  (cartData.items[i].quantity * price)
        }
        if(cartData){
          const saveTotalPrice = await cart.updateOne({userId:userId},{$set:{totalAmount:TotalPriceOfCart}})

        }
    

        const filteredData = products.filter(product => !product.isBlocked);
        //============================================================================
          
            
          

        //============================================================================

        
        

        res.render("cartPage", { products:filteredData,TotalPriceOfCart,cartData,userData });
      } else {
        res.render("cartPage")
      }
    } else {
      res.redirect('/')
    }

  } catch (error) {
    console.log("Error in loadCartPage: ",error);
    next(error)
  }
}

const addToCart = async (req, res, next) => {
  try {
    
    if(req.session.user){
      
      const productId = req.body.id;
      const size = req.body.size;
      const offerPrice = req.body.offerPrice;
      
       const userId = req.session.user._id;
       req.session.userId = userId
       
       const productData = await product.findOne({_id:productId})
       

      const cartItems = {
        productId : productId,
        price:offerPrice,
        size:size,
        quantity:1,
        subTotal:offerPrice,
      }

      const userAlreadyHaveCart = await cart.findOne({userId:userId});
      const productAlerdyInCart = await cart.findOne({
        userId:userId,
        items:{
          $elemMatch: {
            productId: new ObjectId(productId),
            size: size 
        }
      }});
     

      if(userAlreadyHaveCart && !productAlerdyInCart){
          await cart.updateOne({userId:userId},
            {$push:{items: cartItems}}
            )
            res.json({response:true});
      }else{
        const addingToCart = await cart.create({
          userId:userId,
          items:[cartItems]
        });
        res.json({response:true})
      }


    }else{
      res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }
  } catch (error) {
    console.error("Error in addtoCart: ",error);
    next(error);
   
  }

  
  
}
 const productWithSizeCartCheck = async(req, res, next)=>{

           try {

               
            const id = req.query.id;
            const size = req.query.size
            const userId = req.session.user._id;
            
            const checkProduct = await cart.findOne({
                userId:userId,
                      
                        "items":{
                          $elemMatch:{
                            productId:id,
                            size:size
                          }
                        
                      }
            },{
              "items":{
                $elemMatch:{
                  productId:id,
                  size:size
                }
              }
            })
            

            if(checkProduct){
              
              res.json({response:true})
            }else{
             
              res.json({response:false})
            }
            
           } catch (error) {
            console.error("Error in productWithSizeCartCheck: ",error);
            next(error)
            
           }
              
 }

 const deleteCartedItems = async(req, res, next)=>{
     try {

      

     const productId = req.query.id;
     const size = req.query.size;
     const receivedUserId = req.query.userId;
     

     const deletedProduct = await cart.updateOne(
               {userId:receivedUserId},
               {
                $pull:{
                  "items":{
                    productId:productId,
                    size:size
                  }
                }
               }
     )
    
        if(deletedProduct){
          res.json({response:true})
        }else{
          res.json({response:false})
        }

      
     } catch (error) {
      console.error("Error in deleteCartItems: ",error);
      next(error);
      
     }


 }



const incrementQuantity = async (req, res, next)=>{
  
  
 try {

  const {productId,size,index,stock,productPrice } = req.body
  const price = parseInt(productPrice)
  const prdId = new ObjectId(productId)
  const userId = new ObjectId(req.session.user._id)
 
  const cartData = await cart.findOne({userId:new ObjectId(req.session.user._id)})

  const cartD = await cart.findOne({ userId: new ObjectId(req.session.user._id) }, { _id: 0, items: 1 });
  function getQuantity(productId, size, cart) {
    const item = cart.items.find(item =>
      item.productId.equals(productId) && item.size === size
    );
  
    return item ? item.quantity : 0;
  }
  const cartQuantity = getQuantity(new ObjectId(productId), size, cartD );
 

  if(parseInt(stock) > parseInt(cartQuantity)){
    if(parseInt(cartQuantity)<10){

      const increment = await cart.findOneAndUpdate(
        { userId: userId, items: { $elemMatch: { productId: prdId, size: size } } },
        {
          $inc: {
            "items.$.quantity": 1,
            "items.$.subTotal": price,
            totalAmount: price
          }
        },
        { new: true }
      );
             
       const cartData  = await cart.findOne({userId:new ObjectId(req.session.user._id)})
       
       res.json({status:true,totalAmount:cartData.totalAmount})

     

    }else{
      
      res.json({status:false,response:"execeedLimit"})
    }
    
    
  }else{
   
    res.json({status:false,response:"stockLess"})
  }

  
 } catch (error) {
  console.error("Error in incrementQuantity: ",error);
  next(error)
  
 }

}
const decreaseQuantity = async(req, res, next)=>{
       

       try {
         
        const {productId,size,index,stock,productPrice } = req.body;
        const price = parseInt(productPrice)
        const cartD = await cart.findOne({ userId: new ObjectId(req.session.user._id) }, { _id: 0, items: 1 });
                      function getQuantity(productId, size, cart) {
                        const item = cart.items.find(item =>
                          item.productId.equals(productId) && item.size === size
                        );
                      
                        return item ? item.quantity : 0;
                      }
                      const cartQuantity = getQuantity(new ObjectId(productId), size, cartD );
                     

                      if(parseInt(cartQuantity)>1){
                        const decrement = await cart.findOneAndUpdate(
                          {
                            userId: new ObjectId(req.session.user._id),
                            items: {
                              $elemMatch: {
                                productId: new ObjectId(productId),
                                size: size
                              }
                            }
                          },
                          {
                            $inc: {
                              "items.$.quantity": -1,
                              "items.$.subTotal": -price,
                              totalAmount: -price
                            }
                          }
                        );
                        
                         
                         const cartData  = await cart.findOne({userId:new ObjectId(req.session.user._id)})
                         res.json({status:true,totalAmount:cartData.totalAmount})

                      }else{
                        
                        res.json({status:false,quantity:"equalToOne"})
                      }
        
       } catch (error) {
        console.error("Error in decreaseQuantity: ", decreaseQuantity);
        next(error)
        
       }
}

const loadCheckOutPage = async(req, res, next)=>{
          
            try {
              const userData = req.session.user
              if(req.session.user){
                const userId = req.session.user._id;
                const cartData = await cart.findOne({userId:userId});
                
                let products = [];
                if(cartData){
                  for(let i=0; i<cartData.items.length; i++){
                    const productData = await product.findById(cartData.items[i].productId)
                    const offerPrice = await offerHelper.newOfferPrice(productData)
                    const cartSize = cartData.items[i].size;
                    const cartQuantity = cartData.items[i].quantity;
                    const cartPrice = cartData.items[i].price;
                    const finalProduct = Object.assign({},productData.toObject(),
                    {size:cartSize},
                    {price:cartPrice},
                    {quantity:cartQuantity},
                    {offerPrice:offerPrice}
                    )
                    if(products){
                      products.push(finalProduct);
                    }
                  }
                  
                  var TotalPriceOfCart = 0
                  for(let i=0;i<cartData.items.length;i++){
                  const productD = await product.findById(cartData.items[i].productId) 
                  const price = await offerHelper.newOfferPrice(productD)
                  TotalPriceOfCart = TotalPriceOfCart +  (cartData.items[i].quantity * price)
        }   
                  const updateTotalAmount = await cart.updateOne(
                                     {userId:new ObjectId(userId) },
                                     {$set:{totalAmount:TotalPriceOfCart}}
                  )
                 
                }
                 const userAddress = await user.findOne({_id:userId},{address:1})
                
                 

                 const couponData = await coupon.find({isActive:true,
                  "usedByUser": { "$nin": [new ObjectId(userId)] }
                })
               
                  
                res.render("checkOutPage",{products, TotalPriceOfCart, userAddress,couponData,userData})
              }else{
               
                res.redirect('/');
              }
              
            } catch (error) {
              console.error("Error in loadCheckOutPage: ",error);
              next(error);
              
            }
  }


module.exports = {
              loadCartPage,
              addToCart,
              productWithSizeCartCheck,
              deleteCartedItems,
              loadCheckOutPage,
              incrementQuantity,
              decreaseQuantity
}