const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    nameEn: { type: String },
    nameAr: { type: String },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    code: { type: String },
    quantity: { type: Number },
    value: { type: Number },
    usedBy: [{ type: mongoose.Types.ObjectId, ref: "customers" }],
    isActive: { type: Boolean },
    creationDate: { type: Date, default: Date.now() }
})


const couponModel = mongoose.model("coupons", couponSchema)


module.exports = couponModel;