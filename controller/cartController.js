const productModel = require("../models/productModel")
const categoryModel = require("../models/categoryModel")
const userModel = require("../models/userModel")
const cart = require("../models/cartModel")



const loadCartPage = async (req, res)=>{
    res.render("cartPage")
}

module.exports = {
              loadCartPage
}