const user = require("../models/userModel");
const cart = require('../models/cartModel');
const category = require("../models/categoryModel");
const product = require("../models/productModel");
const bcrypt = require("bcrypt");
const order = require("../models/orderModel")
const objectId = require("mongoose").Types.objectId


const loadProfile = async (req, res)=>{
   
   try {
  

    if(req.session.user){
      const userId = req.session.user._id;
   console.log("This is the req.session.user :",req.session.user)
   console.log('This is userId : ',userId);
   const userData = await user.findOne({_id:userId})
   console.log("This is userData :",userData)


    res.render("userProfile",{userData})
    }else{
      console.log("req.session.user is not found in loadprofile profileController")
    }
    
   } catch (error) {
    console.log(error)
    
   }
} 

const   saveUserAdress= async (req, res) => {
  console.log("Entered into saveUserAddress in profileController");

  // Extract data from the request body
  const receivedAddress = {
    name: req.body.addresName,
    mobile: req.body.addressmobile,
    houseName: req.body.housename,
    pincode: req.body.pincode,
    cityOrTown: req.body.townOrCity,
    district: req.body.district,
    state: req.body.state,
    country: req.body.country
  };

  

  const userId = req.session.user._id;

  try {
    // Find the user by ID and push the new address to the 'address' array
    const updateUserAdress = await user.updateOne(
      { _id: userId },
      { $push: { address: receivedAddress } }
    );

    
   res.redirect('/profile')
    
    
  } catch (error) {
    console.error("Error updating user:", error);
    
    res.status(500).send("Internal Server Error");
  }
};


const deleteAddress = async (req, res) => {
  console.log("Entered in deleteAddress of profileController");
  const receivedUserId = req.query.userId;
  const receivedAddressId = req.query.addressId;
  console.log(receivedUserId);
  console.log(receivedAddressId);

  try {
      const deletedAddress = await user.updateOne(
          { _id: receivedUserId },
          {
              $pull: {
                  address: { _id: receivedAddressId }
              }
          }
      );

      if (deletedAddress.nModified === 1) {
          // Check if one document was modified, indicating a successful deletion
          res.json({ response: true });
      } else {
          res.json({ response: false, message: "Address not found or not deleted." });
      }
  } catch (error) {
      console.error("Error deleting address:", error);
     
  }
};

const changePassword = async (req, res) => {
  console.log('Entered into changePassword in profileController');

  try {
    const userId = req.session.user._id;
    const currentPassword = req.body.currentpassword;
    const newPassword = req.body.newpassword;
    const confirmPassword = req.body.confirmpassword;

    console.log('Request Body:', req.body);

    const userData = await user.findById({ _id: userId });
    console.log('User Data:', userData);

    if (!userData) {
      console.log('User not found');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Hashed Password:', userData.password);

    const currentPasswordMatches = await bcrypt.compare(currentPassword, userData.password);
    console.log('Current Password Matches:', currentPasswordMatches);

    if (currentPasswordMatches) {
      if(newPassword === confirmPassword){
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        console.log('Hashed New Password:', hashedNewPassword);
  
        var savePasswordAndCheck = await user.updateOne({ _id: userId }, { password: hashedNewPassword });
        console.log("Password is updated");
       // res.redirect("/profile")
      }else{
        console.log("confirmpassword not same newPassword");
        return res.json({ success: true, message: 'confirm password not same newPassword' });
      }
      

      

      if (savePasswordAndCheck.modifiedCount === 1) {
        console.log('Password changed successfully');
        res.redirect('/profile')
       
      } else {
        console.log('Password not changed');
        
      }
    } else {
      console.log('Current password is incorrect');
      res.redirect('/profile')
     
    }
  } catch (error) {
    console.error('Error:', error);
   
  }
};

const editUserDetails = async (req, res)=>{

        console.log("Entered in editUserDetails in profileController");
        const receivedPassword = req.body.password;

        const userData = await user.findOne({_id:req.session.user._id})
        console.log("This is the userData : ",userData)

        const receivedData = {
                 name:req.body.name,
                 mobile:parseInt(req.body.mobile)
        }
         console.log("This is receiveData : ",receivedData);


         const checkPassword = await bcrypt.compare(receivedPassword, userData.password);
         console.log(checkPassword);

         if(checkPassword){
          const updateUserData = await user.updateOne({_id:req.session.user._id},{$set:receivedData})
         }else{
          console.log("password is incorrect")
         }

}

const loadAddressEdit = async(req, res)=>{
        const receivedAddressId = req.query.addressId
        console.log(receivedAddressId);
        const addressData = await user.findOne({_id:req.session.user._id},{"address":{$elemMatch:{_id:receivedAddressId}}})
        console.log("This is the addressData :",addressData)
             
         res.render("userAddressEdit",{addressData})
            
} 

const updateUserAddress = async (req, res)=>{


  try {
         
        console.log("Entered into updateUserAddress of profileController");
        const addressId = req.query.addressId
        console.log(addressId)
        const userId = req.session.user._id;

        const receivedAddress = {
          name: req.body.addresName,
          mobile: req.body.addressmobile,
          houseName: req.body.housename,
          pincode: req.body.pincode,
          cityOrTown: req.body.townOrCity,
          district: req.body.district,
          state: req.body.state,
          country: req.body.country
        }

       const updatingAddress = await user.updateOne({_id:userId,"address._id":addressId},{$set:{"address.$":receivedAddress}});
       console.log(updatingAddress);
       res.redirect('/profile')
        
       } catch (error) {
        console.log(error)
        
       }

}

const loadOrderDetails = async (req, res)=>{
               console.log("Entered into loadOrderDetails in orderController");
               if(req.session.user){
                const userData = req.session;
               const orderData = await order.find({userId:req.session.user._id})
               console.log("This is orderData",orderData)
               res.render("orderPage",{orderData,userData})
               }else{
                console.log("User is not found in loadorderDetais")
                res.redirect("/")
               }


}

module.exports = {
  loadProfile,
  saveUserAdress,
  deleteAddress,
  changePassword,
  editUserDetails,
  loadAddressEdit,
  updateUserAddress,
  loadOrderDetails

}