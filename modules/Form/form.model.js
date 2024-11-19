const mongoose = require("mongoose");

const formSchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    type: { type: String, enum: ["product", "service"], default: "product" },
    fields: [{ type: mongoose.Types.ObjectId, ref: "fields" }],
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    creationDate: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
})

formSchema.index({ nameEn: 1 });
formSchema.index({ nameAr: 1 });

const formModel = mongoose.model("forms", formSchema)


module.exports = formModel;