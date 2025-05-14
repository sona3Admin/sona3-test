const mongoose = require("mongoose");

const basketSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    variations: [{ type: mongoose.Types.ObjectId, ref: "variations" }],
    subCarts: [{
        _id: { type: String },
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
        usedCashback: { type: Number, default: 0, min: 0 },

    }],
    cartTotal: { type: Number, min: 0, default: 0 },
    cartOriginalTotal: { type: Number, min: 0, default: 0 },
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
    couponShop: { type: mongoose.Types.ObjectId, ref: "shops" },
    usedCashback: { type: Number, default: 0, min: 0 },
    updatedDate: { type: Date, default: Date.now() },
})

basketSchema.index({ customer: 1 });

basketSchema.pre("save", function (next) {
    this.updatedDate = Date.now();
    next();
});

basketSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedDate: Date.now() });
    next();
});

basketSchema.pre("updateOne", function (next) {
    this.set({ updatedDate: Date.now() });
    next();
});

const basketModel = mongoose.model("baskets", basketSchema)

module.exports = basketModel;