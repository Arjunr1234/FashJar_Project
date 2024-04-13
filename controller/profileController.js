const user = require("../models/userModel");
const bcrypt = require("bcrypt");
const order = require("../models/orderModel");
const wallet = require("../models/walletModel");
const objectId = require("mongoose").Types.ObjectId


const loadProfile = async (req, res,next)=>{
   
   try {
    
    const walletData = await wallet.findOne({userId:new objectId(req.session.user._id)})
    

    if(req.session.user){
      const userId = req.session.user._id;
   
   const userData = await user.findOne({_id:userId})
   


    res.render("userProfile",{userData, walletData})
    }else{
      console.log("req.session.user is not found in loadprofile profileController");
    }
    
   } catch (error) {
    console.error("Error found on loadProfile : ",error);
    next(error)
    
   }
} 

const   saveUserAdress= async (req, res, next) => {
  

  
  

  try {

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
    
    const updateUserAdress = await user.updateOne(
      { _id: userId },
      { $push: { address: receivedAddress } }
    );

    
   res.redirect('/profile')
    
    
  } catch (error) {
    console.error("Error updating user:", error);
    
    next(error);
  }
};


const deleteAddress = async (req, res, next) => {
  
 

  try {
    const receivedUserId = req.query.userId;
    const receivedAddressId = req.query.addressId;
    
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
      next(error)
     
  }
};

const changePassword = async (req, res, next) => {
  

  try {
    const userId = req.session.user._id;
    const currentPassword = req.body.currentpassword;
    const newPassword = req.body.newpassword;
    const confirmPassword = req.body.confirmpassword;

    

    const userData = await user.findById({ _id: userId });
    

    if (!userData) {
      
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    

    const currentPasswordMatches = await bcrypt.compare(currentPassword, userData.password);
    

    if (currentPasswordMatches) {
      if (newPassword === confirmPassword) {
        try {
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          const savePasswordAndCheck = await user.updateOne({ _id: userId }, { password: hashedNewPassword });

          if (savePasswordAndCheck.modifiedCount === 1) {
            
            return res.json({ success: true, url: "/profile" });
          } else {
            
            return res.json({ success: false, message: 'Password not changed' });
          }
        } catch (error) {
          console.error('Error updating password:', error);
          return res.json({ success: false, message: 'Internal server error' });
        }
      } else {
        
        return res.json({ success: false, message: 'Confirm password not same as new password' });
      }
    } else {
      
      return res.json({ success: false, message: 'Enter your correct password' });
    }
  } catch (error) {
    console.error('Error in changePassword :', error);
    next(error);
  }
};




const editUserDetails = async (req, res, next)=>{

        
       try {

        const receivedPassword = req.body.password;

        const userData = await user.findOne({_id:req.session.user._id})
        

        const receivedData = {
                 name:req.body.name,
                 mobile:parseInt(req.body.mobile)
        }
         


         const checkPassword = await bcrypt.compare(receivedPassword, userData.password);
         

         if(checkPassword){
          const updateUserData = await user.updateOne({_id:req.session.user._id},{$set:receivedData})
          res.json({success:true})
        
         }else{
          
          res.json({success:false, message:"Enter the correct Password"})
         }
        
       } catch (error) {

        console.error("Error in EditUserDetails: ",error);
        next(error);

        
       }

}

const loadAddressEdit = async(req, res, next)=>{
      try {
        const receivedAddressId = req.query.addressId
        
        const addressData = await user.findOne({_id:req.session.user._id},{"address":{$elemMatch:{_id:receivedAddressId}}})
        
             
         res.render("userAddressEdit",{addressData})
        
      } catch (error) {

        console.error("Error in loadAddressEdit: ",error);
        next(error);
        
        
      }
            
} 

const updateUserAddress = async (req, res, next)=>{


  try {
         
        
        const addressId = req.query.addressId
        
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
        console.log("Error in updateUserAddress: ",error);
        next(error);
        
       }

}

const loadOrderDetails = async (req, res, next)=>{
               
              try {
                 
                if(req.session.user){
                  const userData = req.session;
                 const orderData = await order.find({userId:req.session.user._id})
                 
  
                 let itemsPerPage = 8;
                 let currentPage = parseInt(req.query.page) || 1;
                 let totalPages = Math.ceil(orderData.length / itemsPerPage);
                 let lastPage = totalPages;
                 
                 
                 let startIndex = orderData.length - (currentPage * itemsPerPage);
                 let endIndex = startIndex + itemsPerPage;
                 if (startIndex < 0) {
                    // endIndex += startIndex; 
                     startIndex = 0;
                 }
          
                 const currentProduct = orderData.slice(startIndex, endIndex);
                
                 
                 res.render("orderPage",{orderData:currentProduct,userData, totalPages, currentPage})
                 }else{
                  console.log("User is not found in loadorderDetais")
                  res.redirect("/")
                 }
                
              } catch (error) {
                console.error("Error in loadOrderDetails: ",error);
                next(error)
                
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