const { render } = require("ejs")
const User = require("../models/userModel");
const otpSend = require("../helper/otpHelper")
const otpHelper = require("../helper/otpHelper")
const userHelper = require("../helper/userHelper")
const { response } = require("express")
const bcrypt = require("bcrypt")
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
    console.log(sendedOtp);
    console.log(verifyOtp);
    console.log("start Checking");

    if (sendedOtp === verifyOtp  && Date.now() < req.session.otpExpiry) {
      console.log("otp entered before time expires");
      req.session.otpMatched = true;
      console.log("req in insert user");

      const UserData = req.session.insertedData;
      const response = await userHelper.doSignup(UserData, req.session.otpMatched);
      console.log(response)

      if (!response.status) {
        const error = response.message;
        req.flash("message", error);
        return res.redirect("/register");
      } else {
        const message = response.message;
        req.flash("message", message);
        return res.redirect('/');
      }
    } else {
       console.log("failed otp verification");
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
    console.log(response)
    if (response.login) {
      req.session.user = response.user;
      //console.log('User logged in successfully:', response.user,);
      console.log("user is login",response)
      res.redirect("/userHome");
    } else {
      //console.log('Login failed:', response.loginMessage);
      //res.render("login", { errorMessage: response.loginMessage });
      console.log("error",response)
      req.flash("error",response.loginMessage)
      res.redirect('/')
    }
  } catch (error) {
    //console.error('Error in loginHome:', error);
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
              balance:0
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
         
          console.log("This is place berfore entering into the forloop")
          
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
        //  console.log("This is the productData: ",productData);
          
        //  console.log("This is new Added Products:" ,newAddedProducts)
          
          res.render("userHome", { productData,categoryData,userData,newAddedProducts });
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
        // Only one response should be sent, either redirect or JSON
      //  res.json({ response: true });
        // or
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
  console.log("Entered into loadSample");
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
        console.log("Entered to the loadview product");
         const productId = req.query.id;
         const userData = req.session.user
         
         let products = await product.findById({_id:productId}).lean();
         const calculatedPrice = await offerHelper.newOfferPrice(products);
         products.offerPrice = calculatedPrice

         
         console.log("This is the product view products (athe ith thanne):",products)
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
     console.log("Entered in to display Size")
    if(req.session.user){
      const id = req.params.id;
      const size = req.params.size;
      

      const productData = await product.find({_id:id})
      //console.log("This is product data :" , productData)

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
                console.log("This is category data: ",categoryData)
                const filteredProduct = await product.find({isBlocked:false}).lean()

                for(let i=0; i<filteredProduct.length; i++){
                  const product = filteredProduct[i];
                  const calculatedPrice = await offerHelper.newOfferPrice(product)
                  product.offerPrice = calculatedPrice
                }
                console.log("This is the filetered products: ",filteredProduct);

                res.render("shop",{categoryData, filteredProduct})
}

const filterCatergoryProducts = async(req, res)=>{
                    console.log("Entered into fileterCategory in userController");
                    const categoryId = req.query.catId;
                    const categoryData = await category.find();
                    console.log("This is category Id:",categoryId);
                    const filteredProduct = await product.find({category:new ObjectId(categoryId)}).lean();

                    for(let i=0; i<filteredProduct.length; i++){
                      const product = filteredProduct[i];
                      const calculatedPrice = await offerHelper.newOfferPrice(product)
                      product.offerPrice = calculatedPrice
                    }

                    console.log("This is filtered Product: ",filteredProduct);

                    res.render("shop",{filteredProduct,categoryData})
               
}

const searchProduct = async(req, res)=>{
                  console.log("Entered into search product in userController");
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

                  console.log("This is the searched data: ",filteredProduct);

                  res.render("shop",{filteredProduct,categoryData})
}

const loadEmaiEnterInForgotpassword = async(req, res)=>{
                      console.log("Enter into loadEmaiEnterInForgotpassword in userController");

                      res.render("enterEmailForgotPassword")
}


const verifyingTheEmail = async(req, res)=>{
                        console.log("Entered into verifyingTheEmail in userController");

                         const receivedEmail = req.body.email
                         req.session.storedEmail = receivedEmail

                        const checkUserExist = await User.findOne({email:receivedEmail});
                        console.log("Thsi is Existing user: ",checkUserExist);

                        if(checkUserExist){
                          const result = await otpHelper.sendOtpForgotPassword(receivedEmail);
                          console.log("This is the result: ",result)
                          const expiryTime = 60;
                          req.session.otpExpiry = Date.now()+expiryTime*1000;
                          req.session.otp = result.otp;
                          console.log("This is the otp in the session : ",req.session.otp);
                          

                          if(result.status){
                            res.redirect("/postEmailData");
                          }

                        }else{
                          req.flash("error","User not Exist");

                          res.redirect("/")
                        }
}

const loadOtpForgotPassword = async(req, res)=>{
                       console.log("Entered into loadOtpForgotPassword in userController");
                       
                       const error = req.flash("error")
                       res.render("otpForgotPassword",{error});
}

const loadEnterNewPassword = async(req, res)=>{
                       console.log("Entered into loadEnter new PasswordPage in userController");

                       res.render("enterPassForgotPassword")
}

const  changePassword = async(req, res)=>{
                       console.log("Enter into changePassword in userController");
                       
                       try {

                        console.log("This is the email: ",req.session.storedEmail);

                       console.log("This is the data received: ", req.body)
                       const userData = await User.findOne({email:req.session.storedEmail}).lean();
                       const userId = new ObjectId(userData._id);
                       console.log("This is the userId: ",userId);

                       const { newPassword, confirmPassword} = req.body;

                       if(confirmPassword === newPassword){
                        const hashedPassword = await bcrypt.hash(newPassword,10);
                        const updatePassword = await User.updateOne({_id:userId},{password:hashedPassword});

                        if(updatePassword.modifiedCount === 1){
                          console.log("Passowrd is updated!!");
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
              changePassword

              
              
                    }