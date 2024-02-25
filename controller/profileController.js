const user = require("../models/userModel");
const cart = require('../models/cartModel');
const category = require("../models/categoryModel");
const product = require("../models/productModel");


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


module.exports = {
  loadProfile,
  saveUserAdress,
  deleteAddress

}