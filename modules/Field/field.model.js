const mongoose = require("mongoose");

const fieldSchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    type: { type: String, enum: ["enum", "string", "number"], default: "string" },
    values: [{ en: { type: String }, ar: { type: String }, number: { type: Number } }],
    isRequired: { type: Boolean, default: true },
    isRequested: { type: Boolean, default: false },
    requestedBy: { type: mongoose.Types.ObjectId, ref: "shops" },
    requestDate: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
})


const fieldModel = mongoose.model("fields", fieldSchema)


module.exports = fieldModel;