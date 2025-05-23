const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    mainCategory: { type: mongoose.Types.ObjectId, ref: "categories" },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
    stock: { type: Number, min: 0 },
    variations: [{ type: mongoose.Types.ObjectId, ref: "variations" }],
    defaultVariation: { type: mongoose.Types.ObjectId, ref: "variations" },
    rating: { type: Number, min: 1, default: 1 },
    reviewCount: { type: Number, min: 0, default: 0 },
    isSustainable: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isFood: { type: Boolean, default: false },
    preparationTime: { type: Number },
    creationDate: { type: Date },
    verifyDate: { type: Date },
    lastUpdateDate: { type: Date },
    discountValue: { type: Number, default: 0 },
    orderCount: { type: Number, min: 0, default: 0 },
    hasLowerEnvironmentalImpact: { type: Boolean, default: false },
    isReusable: { type: Boolean, default: false },
})


productSchema.index({ nameEn: 1 });
productSchema.index({ nameAr: 1 });

const productModel = mongoose.model("products", productSchema)


module.exports = productModel;