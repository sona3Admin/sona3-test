const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
    stock: { type: Number, min: 0 },
    variations: [{ type: mongoose.Types.ObjectId, ref: "variations" }],
    defaultVariation: { type: mongoose.Types.ObjectId, ref: "variations" },
    rating: { type: Number, min: 1, default: 1 },
    reviewCount: { type: Number, min: 0, default: 0 },
    isTopDeal: { type: Boolean, default: false },
    isInStock: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    creationDate: { type: Date }
})


const productModel = mongoose.model("products", productSchema)


module.exports = productModel;