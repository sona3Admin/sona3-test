const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
    fields: [{
        _id: { type: mongoose.Types.ObjectId, ref: "fields" },
        field: { type: Object }
    }],
    basePrice: { type: Number, min: 0 },
    images: [{ type: Object }],
    rating: { type: Number, min: 1, default: 1 },
    reviewCount: { type: Number, min: 0, default: 0 },
    isTrending: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    creationDate: { type: Date },
    verifyDate: { type: Date },
    lastUpdateDate: { type: Date },

})


const serviceModel = mongoose.model("services", serviceSchema)


module.exports = serviceModel;