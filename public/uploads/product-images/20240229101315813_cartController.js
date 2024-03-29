const product = require("../models/productModel")
const category = require("../models/categoryModel")
const user = require("../models/userModel")
const cart = require("../models/cartModel")
const ObjectId = require("mongoose").Types.ObjectId
const order = require("../models/orderModel")



const loadCartPage = async (req, res) => {
  try {
    console.log("Entered to loadCartPage");

    if (req.session.user) {
      const userId = req.session.user._id;
      const userCart = await cart.findOne({ userId: userId });
      let products = [];

      if (userCart) {
        for (let i = 0; i < userCart.items.length; i++) {
          const cartProduct = await product.findById(userCart.items[i].productId); 
          console.log("This is the items in the cartProduct", cartProduct)
          const size = userCart.items[i].size;
          const quantity = userCart.items[i].quantity;
          const finalProduct = Object.assign({}, cartProduct.toObject(), {
            size: size
          },{
            userId:userId
          },
            { quantity: quantity })
          if (products) {
            products.push(finalProduct)
          }
        }
        const cartData = await cart.findOne({userId:userId})
             var TotalPriceOfCart = 0
        for(let i=0;i<cartData.items.length;i++){
             TotalPriceOfCart = TotalPriceOfCart +  (cartData.items[i].quantity * cartData.items[i].price)
        }
        console.log("This si the total Price:",TotalPriceOfCart);
        console.log("This is the cartData from cartRednderPage:",cartData)
       // console.log("This is the product that is sending to CartPage: ", products)
        res.render("cartPage", { products,TotalPriceOfCart });
      } else {
        res.render("cartPage")
      }
    } else {
      res.redirect('/')
    }

  } catch (error) {
    console.log(error)
  }
}

const addToCart = async (req, res) => {
  try {
    
    if(req.session.user){
      console.log("Entered into add to cart in controller");
      const productId = req.body.id;
      const size = req.body.size;
  
      console.log("Product ID:", productId);
      console.log("Size clicked:",size);
       const userId = req.session.user._id;
       req.session.userId = userId
       console.log("This is userId: ",userId)
      const productData = await product.findOne({_id:productId})
      console.log(productData);

      const cartItems = {
        productId : productId,
        price:productData.salePrice,
        size:size
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
      console.log("This is already Have Cart: ", userAlreadyHaveCart);
      console.log("This is productAlreadyInCArt :", productAlerdyInCart);

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
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
    
  }

  
  
}
 const productWithSizeCartCheck = async(req, res)=>{

              console.log("Entered into productWithSizeCartCheck");
              const id = req.query.id;
              const size = req.query.size
              console.log(id);
              console.log(size);
              const checkProduct = await cart.findOne({
                        
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
              console.log(checkProduct)

              if(checkProduct){
                console.log("respone:true is sended")
                res.json({response:true})
              }else{
                console.log("response false is sended")
                res.json({response:false})
              }
              
 }

 const deleteCartedItems = async(req, res)=>{
     try {

      console.log("Entered into deleteCartItems");

     const productId = req.query.id;
     const size = req.query.size;
     const receivedUserId = req.query.userId;
     console.log(productId);
     console.log(size);;
     console.log("This is userId: ",receivedUserId);

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
     console.log("This is deleted Products: " ,deletedProduct)
        if(deletedProduct){
          res.json({response:true})
        }else{
          res.json({response:false})
        }

      
     } catch (error) {
      console.log(error)
      
     }


 }

 const changeQuantity = async(req, res)=>{

                    console.log("Entered in to changeQuantity in Cartcontroller")
                    const receivedUserId = new ObjectId(req.query.userId);
                    const receivedProductId = req.query.productId;
                    const alpha = parseInt(req.query.alpha);
                    const receivedSize = req.query.productSize;
                    console.log("This is received userId: ",receivedUserId);
                    console.log("This is receivedProdcutId : ",receivedProductId);
                    console.log("This is alpha : ",alpha);
                    console.log("This is received productSize :",receivedSize);


                    const user = await cart.find({userId:receivedUserId})
                    if(alpha === 1){
                      const updateQuantity1 = await cart.updateOne({userId:receivedUserId,"items":{
                        $elemMatch:{
                          productId:receivedProductId,
                          size:receivedSize
                        }
                    }},
                    {$inc: {
                      "items.$.quantity": 1
                    }})
                    res.json({response:true})

                    }else if(alpha === -1){
                      const updateQuantity2 = await cart.updateOne({userId:receivedUserId,"items":{
                        $elemMatch:{
                          productId:receivedProductId,
                          size:receivedSize
                        }
                    }},
                    {$inc: {
                      "items.$.quantity": -1
                    }})
                    res.json({response:true})

                    }
                                 
 }

  const loadCheckOutPage = async(req, res)=>{
           console.log("Entered in to loadCheckOutPage in the cartController");
            try {

              if(req.session.user){
                const userId = req.session.user._id;
                const cartData = await cart.findOne({userId:userId});
                console.log("This is the cartData in loadCheckoutPage :",cartData);
                let products = [];
                if(cartData){
                  for(let i=0; i<cartData.items.length; i++){
                    const productData = await product.findById(cartData.items[i].productId)
                    const cartSize = cartData.items[i].size;
                    const cartQuantity = cartData.items[i].quantity;
                    const cartPrice = cartData.items[i].price;
                    const finalProduct = Object.assign({},productData.toObject(),
                    {size:cartSize},
                    {price:cartPrice},
                    {quantity:cartQuantity}
                    )
                    if(products){
                      products.push(finalProduct);
                    }
                  }
                  
                  var TotalPriceOfCart = 0
                  for(let i=0;i<cartData.items.length;i++){
                  TotalPriceOfCart = TotalPriceOfCart +  (cartData.items[i].quantity * cartData.items[i].price)
        }  
                  console.log("This is the final proudcts: ",products);
                  console.log("This is the total price of the cart: ",TotalPriceOfCart)
                }
                 const userAddress = await user.findOne({_id:userId},{address:1})
                 console.log("This is the userAddress in loadCheckOutPage ", userAddress)
              
                  res.render("checkOutPage",{products, TotalPriceOfCart, userAddress})
              }else{
                console.log("req.session.user is not found in loadCheckOutPage");
                res.redirect('/')
              }
              
            } catch (error) {
              console.log(error)
              
            }
  }


module.exports = {
              loadCartPage,
              addToCart,
              productWithSizeCartCheck,
              deleteCartedItems,
              changeQuantity,
              loadCheckOutPage
}