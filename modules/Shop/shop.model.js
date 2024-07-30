const mongoose = require("mongoose");


const shopSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    productCategories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    serviceCategories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    phone: { type: String },
    image: { type: Object },
    covers: [{ type: Object }],
    banners: [{ type: Object }],
    shopLicense: [{ type: Object }],
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: Array, default: [0, 0] }
    },
    address: { type: Object },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 1, default: 1 },
    reviewCount: { type: Number, min: 0, default: 0 },
    joinDate: { type: Date },
    verifyDate: { type: Date },
    policyEn: { type: String },
    policyAr: { type: String },
    isFood: { type: Boolean, default: false },
    type: { type: String, enum: ["product", "service"] }
})

shopSchema.index({ location: '2dsphere' });
shopSchema.index({ nameEn: 1 });
shopSchema.index({ nameAr: 1 });

const shopModel = mongoose.model("shops", shopSchema)


module.exports = shopModel;