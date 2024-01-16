const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    subCarts: [{
        shop: { type: mongoose.Types.ObjectId, ref: "shops" },
        items: [{
            product: { type: mongoose.Types.ObjectId, ref: "products" },
            variation: { type: mongoose.Types.ObjectId, ref: "variations" },
            quantity: { type: Number, min: 1 },
            itemTotal: { type: Number, min: 0 }
        }],
        shopTotal: { type: Number, min: 0, default: 0 },
        shopOriginalTotal: { type: Number, min: 0, default: 0 },
        coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
    }],
    cartTotal: { type: Number, min: 0, default: 0 },
    cartOriginalTotal: { type: Number, min: 0, default: 0 },
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },

})

cartSchema.index({ customer: 1 });

const cartModel = mongoose.model("carts", cartSchema)


module.exports = cartModel;