const productOffer = require("../models/productOfferModel");
const categoryOffer = require("../models/categoryOfferModel")

const changeOfferStatus = async (req, res, next) => {
  console.log("Entered into change offerStatus");
  try {
      
      const resultPrd = await productOffer.updateMany(
          { 'categoryOffer.endingDate': { $lt: new Date() } },
          { $set: { 'categoryOffer.offerStatus': false } }
      );

  
      const resultCat = await categoryOffer.updateMany(
          { endingDate: { $lt: new Date() } },
          { $set: { 'productOffer.offerStatus': false } }
      );

      next(); 
  } catch (error) {
      console.error("Error updating offer statuses:", error);
      
      res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
   changeOfferStatus
}