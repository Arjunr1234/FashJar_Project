const product = require("../models/productModel");




const calculateOfferPrice = async (productData)=>{
  console.log("Entered into offerHelper in helper");

  return new Promise(async (resolve, reject)=>{
       try {
             const calculatingOffer = Math.round(productData.regularPrice - (productData.regularPrice*productData.discount/100));
             resolve(calculatingOffer)

        
       } catch (error) {
        consoel.log(error)
        
       }
             
               
  })


  

}


module.exports = {
                        calculateOfferPrice
}