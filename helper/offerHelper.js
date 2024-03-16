const product = require("../models/productModel");
const productOffer = require("../models/productOfferModel");
const categoryOffer = require("../models/categoryOfferModel");




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

const newOfferPrice = async (product)=>{
                 
                   console.log("Entered into newOfferPrice in offerHelper");
                   console.log("This is the recenvied prd: ",product);
                   const catId = product.category
                   const prdId = product._id
                   console.log("This is catId: ",catId.toString())
                   const currentDate = new Date()
                   console.log("This is current date: ",currentDate.toLocaleDateString())
                   const productOffer = await getActiveProductOffer(currentDate)
                   console.log("This is the productOffer:",productOffer)
                   const categoryOffer = await getActiveCategoryOffer(currentDate)
                   console.log("This is active categoryoffers: ",categoryOffer)

                   const findCategoryOfferById = (categoryOffers, categoryId) => {
                    return categoryOffers.find(offer => offer.categoryOffer.category.toString() === categoryId.toString());
                };
                   const letsee = findCategoryOfferById(categoryOffer,catId)
                
                   console.log("This is the finded category letsee: ",letsee)

                   const findProductOfferById = (productOffer,productId) =>{
                       return productOffer.find(offer=>offer.productOffer.product.toString() === productId.toString())
                   }
                   const letseePrd = findProductOfferById(productOffer,prdId)
                   console.log("This is prod letseee: ",letseePrd)




                  //  return new Promise(async(resolve,reject)=>{
                  //     try {

                  //         const currentDate = new Date()
                        
                  //     } catch (error) {
                  //       console.log(error)
                        
                  //     }
                       

                  //  })

                  
                  
             
}

const getActiveProductOffer = async (currentDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await productOffer.find({
        startingDate: { $lte: currentDate },
        endingDate: { $gte: currentDate }
      })
      

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const getActiveCategoryOffer = async(currentDate)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const result = await categoryOffer.find({
        startingDate:{$lte:currentDate},
        endingDate:{$gte:currentDate}
      });
      resolve(result)
      
    } catch (error) {
      console.log(error)
      
    }
  })
}





module.exports = {
                        calculateOfferPrice,
                        newOfferPrice
}