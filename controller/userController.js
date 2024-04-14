
const User = require("../models/userModel");
const otpHelper = require("../helper/otpHelper")
const userHelper = require("../helper/userHelper")
const bcrypt = require("bcrypt");
const product = require("../models/productModel")
const category = require("../models/categoryModel")
const cart = require("../models/cartModel");
const offerHelper = require("../helper/offerHelper");
const wallet = require("../models/walletModel")
const {ObjectId} = require("mongoose").Types


const loginLoad = function (req, res, next) {

 try {
  if(req.session.user){
    res.redirect("/userHome")
  }else{
    const message=req.flash("message")
    const error=req.flash("error")
    res.render("userLogin",{message,error})
  }
  
 } catch (error) {
  console.error("Error in LoginLoad: ",error)
  next(error)
  
 }

}



const loadRegister = function(req, res, next){
   try {

    if(req.session.user){
      res.redirect("/userHome")
     }else{
      const message = req.flash("message")
      const error = req.flash("error")
      res.render("register",{error,message})
     }
    
   } catch (error) {
    console.error("Error in loadRegister: ",error);
    next(error);

    
   }
}


const insertUserWithVerify = async function(req, res, next) {
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
        return res.redirect('/login');
      }
    } else {
       
       req.session.otpExpiry = false;
       
      req.flash("error", "Enter correct otp");
      return res.redirect('/register');
    }
  } catch (error) {
    console.error("Error in insertWithUserVerify: ",error);

    next(error);
  }
};







const loginHome = async (req, res, next) => {
  try {
    const response = await userHelper.loginHome(req.body);
    
    if (response.login) {
      req.session.user = response.user;
      
      res.redirect("/userHome");
    } else {
      
      req.flash("error",response.loginMessage)
      res.redirect('/login')
    }
  } catch (error) {
    
    console.log("Error in loginHome: ",error);
    next(error);
  }
};









const loadUserHome = async function (req, res, next) {
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
      console.error("Error in loadUserHome: ",error);
      next(error)
  }
};

const loadGuestUserHome = async (req, res, next)=>{

          try {
          
           
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
          
        res.render("userHome", { productData:currentProduct, totalPages, currentPage ,categoryData,newAddedProducts });
            
          } catch (error) {

            console.error("Error in loadGuestUserHome: ",error);
            next(error);

            
          }
        
}


const loadLogout = (req, res, next) => {
  try {
    
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
    
  } catch (error) {
    console.error("Error in loadLogout: ",error);
    next(error);
    
  }
};


const loadOtpVerify = async function(req,res,next){
     
       try {
        res.render('otpVerify')
        
       } catch (error) {
        console.error("Error in loadOtyVerify: ",error);
        next(error)
        
       }
      
}   






  


const loadSample = async (req, res, next)=>{
  
            try {

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
              
            } catch (error) {
              console.error("Error in loadSample: ",error);
              next(error)
              
            }
}


const loadVeiwProduct = async(req, res, next)=>{
        
        try {
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
          
        } catch (error) {
           
          console.error("Error in loadViewProduct: ",error);
          next(error);

          
        }

}

const displaySize = async(req, res, next)=>{
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
    console.log("Error in displyaSize: ",error);
    next(error)
    
  }
}

const loadShopProduct = async(req, res, next)=>{

                try {
                  const userData = req.session.user
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
  
                  res.render("shop",{categoryData, filteredProduct:currentProduct, totalPages, currentPage,userData})
                  
                } catch (error) {
                       console.error("Error in loadShopProduct: ",error);
                       next(error)
                  
                }
}

const filterShopProducts = async(req, res, next)=>{
                  
                  
                try {
                  const userData = req.session.user
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

                

                  res.render("shop",{filteredProduct,categoryData,totalPages,currentPage, userData})
                  
                } catch (error) {

                  console.error("Error in filterShopProducts: ",error);
                  next(error)

                  
                }
                                 
}

const filterCatergoryProducts = async(req, res, next)=>{
                        

                      try {

                        const userData = req.session.userData

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

                             res.render("shopCategory",{filteredProduct:currentProduct,totalPages, currentPage,categoryData,categoryId, userData});   
           
                        
                      } catch (error) {

                        console.error("Error in fileterCategory Products: ",error);
                        next(error);

                        
                      }



}

const categoryWiseFiltering = async(req, res, next)=>{
                      
                    try {
                      const userData = req.session.user
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


                      res.render("shopCategory",{filteredProduct,categoryId,categoryData,totalPages, currentPage, userData})
                      
                    } catch (error) {
                        console.error("Error in categoryWiseFiltering: ",error);
                        next(error)
                      
                    }


}





const searchProduct = async(req, res, next)=>{
                  
                 try {
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
                  
                 } catch (error) {
                         console.error("Error in searchProduct: ",error);
                         next(error)

                  
                 }
}

const loadEmaiEnterInForgotpassword = async(req, res, next)=>{
                      

                    try {

                      res.render("enterEmailForgotPassword")
                      
                    } catch (error) {

                      console.error("Error in loadEmaiEnterInForgotpassword : ",error);
                      next(error)

                      
                    }
}


const verifyingTheEmail = async(req, res, next)=>{
                        

                         try {
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

                          res.redirect("/login")
                        }
                          
                         } catch (error) {
                          console.error("Error in verifyingTheEmail : ",error);
                          next(error);

                          
                         }
}

const loadOtpForgotPassword = async(req, res, next)=>{

        try {
          const error = req.flash("error")
          res.render("otpForgotPassword",{error});
          
        } catch (error) {
          console.error("Error in loadOtpForgotPassword: ",error);
          next(error)
          
        }
                       
                       
                     
}

const loadEnterNewPassword = async(req, res)=>{
                       
                       
                       res.render("enterPassForgotPassword")
}

const  changePassword = async(req, res, next)=>{
                       
                       
                       try {

                        

                       
                       const userData = await User.findOne({email:req.session.storedEmail}).lean();
                       const userId = new ObjectId(userData._id);
                       

                       const { newPassword, confirmPassword} = req.body;
                       
                       if(confirmPassword === newPassword){
                        const hashedPassword = await bcrypt.hash(newPassword,10);
                        const updatePassword = await User.updateOne({_id:userId},{password:hashedPassword});

                        if(updatePassword.modifiedCount === 1){
                          
                          req.flash("message","Updated Successfully")
                          res.redirect("/login")
                        }
                        
                       }

                        
                       } catch (error) {
                        console.error("Error in changePassword: ",error);
                        next(error)
                        
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