const product = require("../models/productModel");
const productOffer = require("../models/productOfferModel");
const categoryOffer = require("../models/categoryOfferModel");




const calculateOfferPrice = async (productData)=>{
  

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
                   
                 
                   


                   return new Promise(async(resolve,reject)=>{
                      try {
                                 
                        const regularPrice = product.regularPrice
                   const discount = product.discount;
                  
                   const catId = product.category
                   const prdId = product._id
                   
                   const currentDate = new Date()
                  
                   const productOffer = await getActiveProductOffer(currentDate)
                  // console.log("This is the productOffer:",productOffer)
                   const categoryOffer = await getActiveCategoryOffer(currentDate)
                  // console.log("This is active categoryoffers: ",categoryOffer)

                   const findCategoryOfferById = (categoryOffers, categoryId) => {
                    return categoryOffers.find(offer => offer.categoryOffer.category.toString() === categoryId.toString());
                };
                   const catOffer = findCategoryOfferById(categoryOffer,catId)
                
                //   console.log("This is the CatOffer : ",catOffer)

                   const findProductOfferById = (productOffer,productId) =>{
                       return productOffer.find(offer=>offer.productOffer.product.toString() === productId.toString())
                   }
                   const prdOffer = findProductOfferById(productOffer,prdId)
                 //  console.log("This is PrdOffer: ",prdOffer)

                   if(catOffer!==undefined && prdOffer!==undefined){
                  //  console.log("Entered into carOffer and PrdOffer valid section");
                    
                    if(prdOffer.productOffer.discount > catOffer.categoryOffer.discount){
                    //  console.log("prd offer is greater than CatOffer");
                      const offerPrice = regularPrice - (regularPrice*prdOffer.productOffer.discount/100);
                    //  console.log("This is the offerPrice: ",offerPrice);
                      resolve(parseInt(offerPrice))
                    }else{
                    //  console.log("cat offer is greater than prdOffer")
                    
                      const offerPrice = regularPrice - (regularPrice*catOffer.categoryOffer.discount/100)
                     // console.log("This is the offerPrice: ",offerPrice)
                      resolve(parseInt(offerPrice))
                    }

                   }else if(prdOffer!==undefined){
                  //  console.log("Entered into only productOffer")
                    const offerPrice = regularPrice - (regularPrice*prdOffer.productOffer.discount/100);
                  //  console.log("offerPrice: ",offerPrice);
                    resolve(parseInt(offerPrice))
                   }else if(catOffer!==undefined){
                  //  console.log("Entered into only catOffer");
                    const offerPrice = regularPrice - (regularPrice*catOffer.categoryOffer.discount/100);
                  //  console.log("offerPrice: ",offerPrice)
                    resolve(parseInt(offerPrice))
                   }else{
                  //  console.log("Entered into no CatOffer and prdOffer");
                    const offerPrice = regularPrice - (regularPrice*discount/100);
                  //  console.log("offerPrice: ",offerPrice)
                    resolve(parseInt(offerPrice))
                   }

                   

                          
                        
                      } catch (error) {
                        console.log(error)
                        
                      }
                       

                   })

                  
                  
             
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