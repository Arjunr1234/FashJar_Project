const { render } = require("ejs")
const User = require("../models/userModel");
const otpSend = require("../helper/otpHelper")
const otpHelper = require("../helper/otpHelper")
const userHelper = require("../helper/userHelper")
const { response } = require("express")
const bcrypt = require("bcrypt")
const order = require("../models/orderModel");
const product = require("../models/productModel")
const category = require("../models/categoryModel")
const cart = require("../models/cartModel");
const offerHelper = require("../helper/offerHelper");
const wallet = require("../models/walletModel")
const wishlist  = require("../models/wishlistModel")
const {ObjectId} = require("mongoose").Types


const loginLoad = function (req, res) {

  if(req.session.user){
    res.redirect("/userHome")
  }else{
    const message=req.flash("message")
    const error=req.flash("error")
    res.render("userLogin",{message,error})
  }

}



const loadRegister = function(req, res){
     if(req.session.user){
      res.redirect("/userHome")
     }else{
      const message = req.flash("message")
      const error = req.flash("error")
      res.render("register",{error,message})
     }
}


const insertUserWithVerify = async function(req, res) {
  try {
    
    const sendedOtp = req.session.otp;
    const verifyOtp = req.body.otp;
    

    if (sendedOtp === verifyOtp  && Date.now() < req.session.otpExpiry) {
      
      req.session.otpMatched = true;
      

      const UserData = req.session.insertedData;
      
      const response = await userHelper.doSignup(UserData, req.session.otpMatched);
      

      if (!response.status) {
        const error = response.message;
        req.flash("message", error);
        return res.redirect("/register");
      } else {

         if(UserData.refferalCode){
          const userWithRefferalCode = await User.findOne({refferalCode:UserData.refferalCode});
          

          if(userWithRefferalCode){
            
            const userHaveWallet = await wallet.findOne({ userId: userWithRefferalCode._id });
           


            if (userHaveWallet) {
              const data = {
                  amount: 200,
                  date: new Date(),
                  paymentMethod: "Referral Reward",
                  isReceived: true
              };
          
              const updating = await wallet.updateOne(
                  { userId: userWithRefferalCode._id },
                  {
                      $push: { walletDatas: data },
                      $inc: { balance: 200 }
                  }
              );
          } else {
              const creating = await wallet.create({
                  userId: userWithRefferalCode._id, 
                  balance: 200,
                  walletDatas: [
                      {
                          amount: 200,
                          date: new Date(),
                          paymentMethod: "Referral Reward",
                          isReceived: true
                      },
                  ],
              });
          }
          
          }

          
         }


        const message = response.message;
        req.flash("message", message);
        return res.redirect('/');
      }
    } else {
       
       req.session.otpExpiry = false;
       
      req.flash("error", "Enter correct otp");
      return res.redirect('/register');
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/register");
  }
};







const loginHome = async (req, res) => {
  try {
    const response = await userHelper.loginHome(req.body);
    
    if (response.login) {
      req.session.user = response.user;
      
      res.redirect("/userHome");
    } else {
      
      req.flash("error",response.loginMessage)
      res.redirect('/')
    }
  } catch (error) {
    
      res.status(500).send('Internal Server Error');
  }
};









const loadUserHome = async function (req, res) {
  try {
      if (req.session.user) {
          const userData = await User.findOne({ _id: req.session.user });
          const name = userData.name;

          const findingWallet = await wallet.findOne({userId:new ObjectId(req.session.user._id)})

          if(!findingWallet){  
            const createWallet = await wallet.create({
              userId:req.session.user._id,
              balance: 100,
              walletDatas: [
                  {
                      amount: 100,
                      date: new Date(),
                      paymentMethod: "Welcome Reward",
                      isReceived: true
                  },
              ],
            })

          }

         
          

          const productData = await product.aggregate([
              {
                  $match: {
                      "isBlocked": false
                  }  
              },
              {
                  $lookup: {
                      from: "categories",
                      localField: "category",
                      foreignField: "_id",
                      as: "newField"
                  }
              }
          ]);

          const categoryData = await category.find({isListed:true})

          const cartData = await cart.findOne({userId:userData._id})

          

         
         
          
          
          for(let i=0; i<productData.length; i++){
            const product = productData[i];
            const caluclatedPrice = await offerHelper.newOfferPrice(product)
            product.offerPrice = caluclatedPrice
          }
         

          const newAddedProducts = await product.find({"isBlocked":false}).sort({_id:-1}).lean();
           for(let i=0; i<newAddedProducts.length; i++){
             const product = newAddedProducts[i];
             const calculatedPrice = await offerHelper.newOfferPrice(product)
             product.offerPrice = calculatedPrice
           }
        
          
        
        let itemsPerPage = 9
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(productData.length/itemsPerPage)
        const currentProduct = productData.slice(startIndex,endIndex);
          
        res.render("userHome", { productData:currentProduct, totalPages, currentPage ,categoryData,userData,newAddedProducts });
      } else {
          res.redirect("/");
      } 
  } catch (error) {
      console.log(error.message);
  }
};

const loadGuestUserHome = async (req, res)=>{

           const productData = await product.aggregate([
              {
                  $match: {
                      "isBlocked": false
                  }  
              },
              {
                  $lookup: {
                      from: "categories",
                      localField: "category",
                      foreignField: "_id",
                      as: "newField"
                  }
              }
          ]);
          const categoryData = await category.find({isListed:true});
          
            
            res.render("userHome",{productData,categoryData})
}


const loadLogout = (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error in logout:", err);
        res.status(500).json({ response: false, error: "Logout failed" });
      } else {
       
         res.redirect("/");
      }
    });
  } else {
    res.redirect("/");
  }
};


const loadOtpVerify = async function(req,res,next){
     
        res.render('otpVerify')
      
}   






  


const loadSample = async (req, res)=>{
  
  const products  = await product.find({_id:'65cdd01b55d639d38a200df2'})
  const productData = await product.aggregate([
    {
        $match: {
            "isBlocked": false
        }  
    },
    {
        $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "newField"
        }
    }
]);
  
  res.render("sample",{productData});
}


const loadVeiwProduct = async(req, res)=>{
        
         const productId = req.query.id;
         const userData = req.session.user
         
         let products = await product.findById({_id:productId}).lean();
         const calculatedPrice = await offerHelper.newOfferPrice(products);
         products.offerPrice = calculatedPrice

         
         
        //  console.log("offerprice: ",products.offerPrice)
////////////////////////////////////////////////////////////////////////////////////////////////
        // const userId = userData._id
        // const wishlistData = await wishlist.findOne({userId:new Object(userId)})

        // console.log("This is wishlist data: ",wishlistData)

        // var check = wishlistData.products.find(function(product) {
        //   return  product.productId.toString() === productId.toString();
          
          
        // });

        // console.log("This is check:????????????????????",check);
////////////////////////////////////////////////////////////////////////////////////////////////////
         
         res.render("productView",{products,userData});

}

const displaySize = async(req, res)=>{
  try {
     
    if(req.session.user){
      const id = req.params.id;
      const size = req.params.size;
      

      const productData = await product.find({_id:id})
      

      const small = productData[0].size.s.quantity
      const medium = productData[0].size.m.quantity
      const large = productData[0].size.l.quantity
      
      if(size === 's'){
        res.json({message:small})
      }else if(size === 'm'){
        res.json({message:medium})
      }else if(size === 'l'){
        res.json({message:large})
      }

    }else{
      res.json({message:false})
    }
    
  } catch (error) {
    console.log(error)
    
  }
}

const loadShopProduct = async(req, res)=>{

                const categoryData = await category.find()
                
                const filteredProduct = await product.find({isBlocked:false}).lean();

                for(let i=0; i<filteredProduct.length; i++){
                  const product = filteredProduct[i];
                  const calculatedPrice = await offerHelper.newOfferPrice(product)
                  product.offerPrice = calculatedPrice
                }
                

                let itemsPerPage = 9;
                let currentPage = parseInt(req.query.page) || 1;
                let startIndex = (currentPage-1) * itemsPerPage;
                let endIndex = startIndex + itemsPerPage;
                let totalPages = Math.ceil(filteredProduct.length/itemsPerPage);
                const currentProduct = filteredProduct.slice(startIndex,endIndex);

                res.render("shop",{categoryData, filteredProduct:currentProduct, totalPages, currentPage})
}

const filterShopProducts = async(req, res)=>{
                  
                  
                  const categoryData = await category.find()
                  const value = req.query.criteria;
                  const totalPages = 1;
                  const currentPage = 1;
                  

                  if(value === 'lowToHigh'){
                     

                     const filteredTheProduct = await product.find({isBlocked:false}).lean();

                     for(let i=0; i<filteredTheProduct.length; i++){
                      const product = filteredTheProduct[i];
                      const calculatedPrice = await offerHelper.newOfferPrice(product)
                      product.offerPrice = calculatedPrice
                    }
                    function sortByOfferPrice(products) {
                      return products.sort((a, b) => a.offerPrice - b.offerPrice);
                    }
                    
                    var filteredProduct = sortByOfferPrice(filteredTheProduct);

                     


                  }else if(value === 'highToLow'){
                         

                         const filteredTheProduct = await product.find({isBlocked:false}).lean();

                         for(let i=0; i<filteredTheProduct.length; i++){
                          const product = filteredTheProduct[i];
                          const calculatedPrice = await offerHelper.newOfferPrice(product)
                          product.offerPrice = calculatedPrice
                        }
                        function sortByOfferPrice(products) {
                          return products.sort((a, b) => b.offerPrice - a.offerPrice);
                        }
                        
                        var filteredProduct = sortByOfferPrice(filteredTheProduct);
    
                         



                  }else if(value === 'a-z'){
                         

                         const filteredTheProduct = await product.find({isBlocked:false}).lean();

                         for(let i=0; i<filteredTheProduct.length; i++){
                          const product = filteredTheProduct[i];
                          const calculatedPrice = await offerHelper.newOfferPrice(product)
                          product.offerPrice = calculatedPrice
                        }
                        function sortProductsByName(products) {
                          return products.sort((a, b) => a.productName.localeCompare(b.productName));
                        }
                        
                        var filteredProduct = sortProductsByName(filteredTheProduct);
    
                       





                  }

                

                  res.render("shop",{filteredProduct,categoryData,totalPages,currentPage})
                                 
}

const filterCatergoryProducts = async(req, res)=>{
                        

                        const categoryId = req.query.catId;
                        
                        const categoryData = await category.find();

                        const filteredProduct = await product.find({category:new ObjectId(categoryId)}).lean();

                             for(let i=0; i<filteredProduct.length; i++){
                                     const product = filteredProduct[i];
                                     const calculatedPrice = await offerHelper.newOfferPrice(product)
                                     product.offerPrice = calculatedPrice
                                }

                                let itemsPerPage = 9;
                                let currentPage = parseInt(req.query.page) || 1;
                                let startIndex = (currentPage-1)* itemsPerPage;
                                let endIndex = startIndex + itemsPerPage;
                                let totalPages = Math.ceil(filteredProduct.length/itemsPerPage);
                                const currentProduct = filteredProduct.slice(startIndex,endIndex);

                             res.render("shopCategory",{filteredProduct:currentProduct,totalPages, currentPage,categoryData,categoryId});   




}

const categoryWiseFiltering = async(req, res)=>{
                      
                      const value = req.query.criteria;
                      const categoryData = await category.find();
                      const totalPages = 1;
                      const currentPage = 1;
                      const categoryId = req.query.categoryId;
                      

                      if(value === 'lowToHigh'){
                          
                          
                          const filteredTheProduct = await product.find({isBlocked:false,category:new ObjectId(categoryId)}).lean();
                          

                          for(let i=0; i<filteredTheProduct.length; i++){
                            const product = filteredTheProduct[i];
                            const calculatedPrice = await offerHelper.newOfferPrice(product)
                            product.offerPrice = calculatedPrice
                          }
                          function sortByOfferPrice(products) {
                            return products.sort((a, b) => a.offerPrice - b.offerPrice);
                          }
                          
                          var filteredProduct = sortByOfferPrice(filteredTheProduct);
      
                          

                      }else if(value === 'highToLow'){
                        

                        const filteredTheProduct = await product.find({isBlocked:false,category:new ObjectId(categoryId)}).lean();

                        for(let i=0; i<filteredTheProduct.length; i++){
                         const product = filteredTheProduct[i];
                         const calculatedPrice = await offerHelper.newOfferPrice(product)
                         product.offerPrice = calculatedPrice
                       }
                       function sortByOfferPrice(products) {
                         return products.sort((a, b) => b.offerPrice - a.offerPrice);
                       }
                       
                       var filteredProduct = sortByOfferPrice(filteredTheProduct);
   
                        



                 }else if(value === 'a-z'){
                        

                        const filteredTheProduct = await product.find({isBlocked:false,category:new ObjectId(categoryId)}).lean();

                        for(let i=0; i<filteredTheProduct.length; i++){
                         const product = filteredTheProduct[i];
                         const calculatedPrice = await offerHelper.newOfferPrice(product)
                         product.offerPrice = calculatedPrice
                       }
                       function sortProductsByName(products) {
                         return products.sort((a, b) => a.productName.localeCompare(b.productName));
                       }
                       
                       var filteredProduct = sortProductsByName(filteredTheProduct);
   
                        




                 }


                      res.render("shopCategory",{filteredProduct,categoryId,categoryData,totalPages, currentPage})


}





const searchProduct = async(req, res)=>{
                  
                  const receivedData = req.body.productName
                  const categoryData = await category.find();
                  const filteredProduct = await product.aggregate([
                    
                      {
                        $lookup: {
                          from: "categories",
                          localField: "category",
                          foreignField: "_id",
                          as: "category"
                        }
                      },
                      {$unwind:"$category"},
                      {
                        $match: {
                          $or: [
                            { productName: { $regex: new RegExp("^" + receivedData, "i") } },
                            { "category.name": { $regex: new RegExp("^" + receivedData, "i") } }
                          ]
                        }
                      },
                    
                  ])
                  for(let i=0; i<filteredProduct.length; i++){
                    const product = filteredProduct[i];
                    const calculatedPrice = await offerHelper.newOfferPrice(product)
                    product.offerPrice = calculatedPrice
                  }

                  

                  res.render("shop",{filteredProduct,categoryData})
}

const loadEmaiEnterInForgotpassword = async(req, res)=>{
                      

                      res.render("enterEmailForgotPassword")
}


const verifyingTheEmail = async(req, res)=>{
                        

                         const receivedEmail = req.body.email
                         req.session.storedEmail = receivedEmail

                        const checkUserExist = await User.findOne({email:receivedEmail});
                        

                        if(checkUserExist){
                          const result = await otpHelper.sendOtpForgotPassword(receivedEmail);
                          
                          const expiryTime = 60;
                          req.session.otpExpiry = Date.now()+expiryTime*1000;
                          req.session.otp = result.otp;
                          
                          

                          if(result.status){
                            res.redirect("/postEmailData");
                          }

                        }else{
                          req.flash("error","User not Exist");

                          res.redirect("/")
                        }
}

const loadOtpForgotPassword = async(req, res)=>{
                       
                       
                       const error = req.flash("error")
                       res.render("otpForgotPassword",{error});
}

const loadEnterNewPassword = async(req, res)=>{
                       

                       res.render("enterPassForgotPassword")
}

const  changePassword = async(req, res)=>{
                       
                       
                       try {

                        

                       
                       const userData = await User.findOne({email:req.session.storedEmail}).lean();
                       const userId = new ObjectId(userData._id);
                       

                       const { newPassword, confirmPassword} = req.body;

                       if(confirmPassword === newPassword){
                        const hashedPassword = await bcrypt.hash(newPassword,10);
                        const updatePassword = await User.updateOne({_id:userId},{password:hashedPassword});

                        if(updatePassword.modifiedCount === 1){
                          
                          req.flash("message","Updated Successfully")
                          res.redirect("/")
                        }
                        
                       }

                        
                       } catch (error) {
                        console.log(error)
                        
                       }

}




module.exports = { 


              loadSample,
              loginLoad,
              loadRegister,
              insertUserWithVerify,  
              loadUserHome,
              loadLogout,
              loadOtpVerify,
              loginHome,
              loadVeiwProduct,
              displaySize,
              loadGuestUserHome,
              loadShopProduct,
              filterCatergoryProducts,
              searchProduct,
              loadEmaiEnterInForgotpassword,
              verifyingTheEmail,
              loadOtpForgotPassword,
              loadEnterNewPassword,
              changePassword,
              filterShopProducts,
              categoryWiseFiltering

              
              
                    }