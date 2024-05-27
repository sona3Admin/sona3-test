const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    variations: [{ type: mongoose.Types.ObjectId, ref: "variations" }],
    subCarts: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
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
    couponShop: { type: mongoose.Types.ObjectId, ref: "shops" },
    usedCashback: { type: Number, default: 0, min: 0 },
})

cartSchema.index({ customer: 1 });

const cartModel = mongoose.model("carts", cartSchema)


module.exports = cartModel;