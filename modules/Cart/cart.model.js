const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers", required: true },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    items: [{
        product: { type: mongoose.Types.ObjectId, ref: "products" },
        quantity: Number, min: 1,
        itemTotal: Number, min: 0
    }],
    itemsTotal: { type: Number, min: 0, required: true },
    originalItemsTotal: { type: Number, min: 0, required: true },
    coupon: { type: mongoose.Types.Object, ref: "coupons" },

})


const cartModel = mongoose.model("carts", cartSchema)


module.exports = cartModel;