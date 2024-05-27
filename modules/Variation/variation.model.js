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
    rank: { type: Number, min: 1 },
    packages: [{
        quantity: { type: Number, min: 1 },
        price: { type: Number, min: 0 }, // front will sort by price ascending
        originalPrice: { type: Number, min: 0 }
    }],
    minPackage: {
        quantity: { type: Number, min: 1 },
        price: { type: Number, min: 0 },
        originalPrice: { type: Number, min: 0 }
    },
    defaultPackage: { // best offer
        quantity: { type: Number, min: 1 },
        price: { type: Number, min: 0 },
        originalPrice: { type: Number, min: 0 }
    },
    creationDate: { type: Date, default: Date.now() },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
})

variationSchema.index({ descriptionEn: 1 });
variationSchema.index({ descriptionAr: 1 });

const variationModel = mongoose.model("variations", variationSchema)


module.exports = variationModel;