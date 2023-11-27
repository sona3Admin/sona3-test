const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    items: [{
        shop: { type: mongoose.Types.ObjectId, ref: "shops" },
        product: { type: mongoose.Types.ObjectId, ref: "products" },
        variation: { type: mongoose.Types.ObjectId, ref: "variations" },
        quantity: { type: Number, min: 1 },
        itemTotal: { type: Number, min: 0 }
    }],
    itemsTotal: { type: Number, min: 0, default: 0 },
    originalItemsTotal: { type: Number, min: 0, default: 0 },
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },

})


const cartModel = mongoose.model("carts", cartSchema)


module.exports = cartModel;