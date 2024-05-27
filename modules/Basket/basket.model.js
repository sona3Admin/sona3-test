const mongoose = require("mongoose");

const basketSchema = mongoose.Schema({
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
        usedLoyaltyPoints: { type: Object },
    }],
    cartTotal: { type: Number, min: 0, default: 0 },
    cartOriginalTotal: { type: Number, min: 0, default: 0 },
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
    usedLoyaltyPoints: { type: Object },
})

basketSchema.index({ customer: 1 });

const basketModel = mongoose.model("baskets", basketSchema)


module.exports = basketModel;