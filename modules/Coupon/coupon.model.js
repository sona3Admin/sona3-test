const mongoose = require("mongoose");
const uniqueCode = require("short-unique-id");
const couponCode = new uniqueCode()

const couponSchema = mongoose.Schema({
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    nameEn: { type: String },
    nameAr: { type: String },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    code: { type: String },
    quantity: { type: Number, min: 0, default: 1 },
    value: { type: Number, min: 0, default: 0 },
    usedBy: [{ type: mongoose.Types.ObjectId, ref: "customers" }],
    isActive: { type: Boolean, default: true },
    creationDate: { type: Date, default: Date.now() },
    expirationDate: { type: Date, default: Date.now() },
})

couponSchema.pre("save", async function (next) {
    this.code = await couponCode.randomUUID(10)
    next();
})

const couponModel = mongoose.model("coupons", couponSchema)


module.exports = couponModel;