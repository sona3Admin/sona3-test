const mongoose = require("mongoose");

const formSchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    type: { type: String, enum: ["product", "service"], default: "product" },
    fields: [{ type: mongoose.Types.ObjectId, ref: "fields" }],
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    isRequested: { type: Boolean, default: false },
    requestedBy: { type: mongoose.Types.ObjectId, ref: "sellers" },
    requestDate: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
})


const formModel = mongoose.model("forms", formSchema)


module.exports = formModel;