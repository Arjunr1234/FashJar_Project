const user = require("../models/userModel");
const cart = require('../models/cartModel');
const category = require("../models/categoryModel");
const product = require("../models/productModel");
const bcrypt = require("bcrypt")


const loadProfile = async (req, res)=>{
   
   const userId = req.session.user._id;
   console.log('This is userId : ',userId);
   const userData = await user.findOne({_id:userId})
   console.log("This is userData :",userData)


    res.render("userProfile",{userData})
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
      res.status(500).json({ response: false, message: "Internal server error" });
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
      }else{
        console.log("confirmpassword not same newPassword");
        return res.json({ success: true, message: 'confirm password not same newPassword' });
      }
      

      

      if (savePasswordAndCheck.modifiedCount === 1) {
        console.log('Password changed successfully');
        return res.json({ success: true, message: 'Password changed successfully' });
      } else {
        console.log('Password not changed');
        return res.json({ success: false, message: 'Password not changed' });
      }
    } else {
      console.log('Current password is incorrect');
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  loadProfile,
  saveUserAdress,
  deleteAddress,
  changePassword

}