const product = require("../models/productModel")
const category = require("../models/categoryModel")
const user = require("../models/userModel")
const cart = require("../models/cartModel")
const offerHelper = require("../helper/offerHelper")
const ObjectId = require("mongoose").Types.ObjectId
const order = require("../models/orderModel")
const wishlist = require("../models/wishlistModel");



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
        console.log("This si the total Price:",TotalPriceOfCart);
        console.log("This is the cartData from cartRednderPage:",cartData)
      //  console.log("This is products: ",products);
        console.log("This is the product that is sending to CartPage: ", products)
        res.render("cartPage", { products,TotalPriceOfCart,cartData });
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
      const offerPrice = req.body.offerPrice;
      console.log("This is the offerPrice in addToCart: ",offerPrice)
  
      console.log("Product ID:", productId);
      console.log("Size clicked:",size);
       const userId = req.session.user._id;
       req.session.userId = userId
       console.log("This is offerPrice: ",offerPrice)
       console.log("This is userId: ",userId)
      const productData = await product.findOne({_id:productId})
      console.log(productData);

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

//  const changeQuantity = async(req, res)=>{

//                     console.log("Entered in to changeQuantity in Cartcontroller")
//                     const receivedUserId = new ObjectId(req.query.userId);
//                     const receivedProductId = req.query.productId;
//                     const alpha = parseInt(req.query.alpha);
//                     const receivedSize = req.query.productSize;
//                     console.log("This is received userId: ",receivedUserId);
//                     console.log("This is receivedProdcutId : ",receivedProductId);
//                     console.log("This is alpha : ",alpha);
//                     console.log("This is received productSize :",receivedSize);

//                     let products = await product.findOne({ _id: receivedProductId });

//                     if (products && products.size && products.size[receivedSize]) {
//                       var sizeQuantityInProduct = products.size[receivedSize].quantity;
//                       console.log(`Quantity for size ${receivedSize}: ${sizeQuantityInProduct}`);
//                     } else {
//                       console.log(`Product with ID ${receivedProductId} or size ${receivedSize} not found.`);
//                     }
//                     const cartD = await cart.findOne({ userId: receivedUserId }, { _id: 0, items: 1 });
//                     console.log("The cartData: ", cartD);
                    
//                     function getQuantity(productId, size, cart) {
//                       const item = cart.items.find(item =>
//                         item.productId.equals(productId) && item.size === size
//                       );
                    
//                       return item ? item.quantity : 0;
//                     }
                    
//                     const result = getQuantity(
//                       new ObjectId(receivedProductId), // replace with your actual productId
//                       receivedSize, // replace with your actual size
//                       cartD
//                     );
                    
//                   //  console.log("This is the cart quantity size: ", result);
                    
                   
//                   const cartSizeQuantity = result;
//                   const productSizeQuantity = parseInt(sizeQuantityInProduct);
//                   console.log("Thsi is cartsize Quantity : ",cartSizeQuantity);
//                   console.log("This is productsize Quanttiy ;  ",productSizeQuantity);

//                   if(productSizeQuantity > cartSizeQuantity || alpha === -1){

//                     console.log("Entered into else of quatity exceed");

//                     const user = await cart.find({userId:receivedUserId})
//                     if(alpha === 1){
//                       const updateQuantity1 = await cart.updateOne({userId:receivedUserId,"items":{
//                         $elemMatch:{
//                           productId:receivedProductId,
//                           size:receivedSize
//                         }
//                     }},
//                     {$inc: {
//                       "items.$.quantity": 1
//                     }})
//                     res.json({response:true})

//                     }else if(alpha === -1){
//                       const updateQuantity2 = await cart.updateOne({userId:receivedUserId,"items":{
//                         $elemMatch:{
//                           productId:receivedProductId,
//                           size:receivedSize
//                         }
//                     }},
//                     {$inc: {
//                       "items.$.quantity": -1
//                     }})
//                     res.json({response:true})

//                     }
                    
//                   }else{

//                     console.log("Entered in to quantity exceed")
//                     res.json({response:false})
                   


//                   }


// }

const incrementQuantity = async (req, res)=>{
  console.log("Entered into increment quantity of cartController");
  
  const {productId,size,index,stock,productPrice } = req.body
  const price = parseInt(productPrice)
  const prdId = new ObjectId(productId)
  const userId = new ObjectId(req.session.user._id)
  console.log("Thi s is new userId: ",userId);
  console.log("This i s prdID: ",prdId)
  console.log("This is productId: ",new ObjectId(productId));
  console.log("This size of product: ",size);
  console.log("This is index :",index);
  console.log("This is stock of prodcut: ",parseInt(stock));
  console.log("This is price: ",price)
  console.log("This is Productprice : ",productPrice)
  console.log("This is userId: ",req.session.user._id)
  const cartData = await cart.findOne({userId:new ObjectId(req.session.user._id)})

  const cartD = await cart.findOne({ userId: new ObjectId(req.session.user._id) }, { _id: 0, items: 1 });
  function getQuantity(productId, size, cart) {
    const item = cart.items.find(item =>
      item.productId.equals(productId) && item.size === size
    );
  
    return item ? item.quantity : 0;
  }
  const cartQuantity = getQuantity(new ObjectId(productId), size, cartD );
  console.log("This is the new cartQuanty: ",cartQuantity)

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
             console.log("show that  increment: ",increment)
       const cartData  = await cart.findOne({userId:new ObjectId(req.session.user._id)})
       console.log("This is cartData totalAnount: ",cartData.totalAmount)
       res.json({status:true,totalAmount:cartData.totalAmount})

       console.log("This is incremented :",increment)

    }else{
      console.log("10 unit is exceed per cart");
      res.json({status:false,response:"execeedLimit"})
    }
    
    
  }else{
    console.log("storck is less")
    res.json({status:false,response:"stockLess"})
  }


}
const decreaseQuantity = async(req, res)=>{
        console.log("Entered into decrease quantity in the cartController");

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
                      console.log("This is the new cartQuanty: ",cartQuantity)

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
                        
                         console.log("this is decrement:",decrement);
                         const cartData  = await cart.findOne({userId:new ObjectId(req.session.user._id)})
                         res.json({status:true,totalAmount:cartData.totalAmount})

                      }else{
                        console.log('Error: quantity is 1')
                        res.json({status:false,quantity:"equalToOne"})
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
              loadCheckOutPage,
              incrementQuantity,
              decreaseQuantity
}