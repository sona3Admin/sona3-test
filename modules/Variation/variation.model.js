const mongoose = require("mongoose");

const variationSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    product: { type: mongoose.Types.ObjectId, ref: "products" },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    fields: [{
        _id: { type: mongoose.Types.ObjectId, ref: "fields" },
        field: { type: Object },
        value: {}
    }],
    images: [{ type: Object }],
    stock: { type: Number, min: 0 },
    quantity: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
    originalPrice: { type: Number, min: 0 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
})


const variationModel = mongoose.model("variations", variationSchema)


module.exports = variationModel;