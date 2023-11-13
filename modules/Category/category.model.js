const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    type: { type: String, required: true, enum: ["shop", "product", "service"] },
    image: { type: Object },
    subCategories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    isSubCategory: { type: Boolean, default: false },
    parentCategory: { type: mongoose.Types.ObjectId, ref: "categories" },
    isRequested: { type: Boolean, default: false },
    requestedBy: { type: mongoose.Types.ObjectId, ref: "shops" },
    requestDate: { type: Date, default: Date.now() },
    isActive: { type: Boolean, default: false }
})


const categoryModel = mongoose.model("categories", categorySchema)


module.exports = categoryModel;