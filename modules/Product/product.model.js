const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers", required: true },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    images: [{ type: Object }],
    salePrice: { type: Number, min: 0 },
    originalPrice: { type: Number, min: 0 },
    quantity: { type: Number, min: 0 },
    rating: { type: Number, min: 1 },
    reviewCount: { type: Number, min: 0 },
    isTopDeal: { type: Boolean, default: false },
    isInStock: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    creationDate: { type: Date }
})


const productModel = mongoose.model("products", productSchema)


module.exports = productModel;