const { ObjectId } = require("mongodb");
const cart = require("../models/cartModel");
const productModel = require("../models/productModel");

const checkingQuantity = async (data) => {
    console.log("This is userId : ", data)
    const userCart = await cart.findOne({ userId: new ObjectId(data) })
    console.log("This is the cart: ", userCart)
    let response = {}
    for (let item of userCart.items) {
        const product = await productModel.findOne({ _id: item.productId });
        console.log("This is product: ", product)
        if (product.size[item.size].quantity < item.quantity) {
            response.status = false;
            response.message = `Insufficient Quantity for product ${product.productName} `;
            return response; // Returning instead of resolving, as we're in an async function
        }
    }
    response.status = true;
    return response; // Returning after the loop completes
}

module.exports = {
    checkingQuantity
}
