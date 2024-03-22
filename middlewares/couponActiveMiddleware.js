const coupon = require("../models/couponModel");

const checkCoupon = async (req, res, next)=>{
  const couponD = await coupon.updateMany(
    { expireOn: { $lt: new Date() } }, 
    { $set: { isActive: false } } 
  )
  const couponDa = await coupon.updateMany(
    { expireOn: { $gte: new Date() } }, 
    { $set: { isActive: true } } 
  )
  next()
 
}

module.exports = { checkCoupon }