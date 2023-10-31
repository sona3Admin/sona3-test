const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    type: { type: String, required: true, enum: ["seller", "product"] },
    image: { type: Object },
    subCategories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    isSubCategory: { type: Boolean, default: false }
})


const categoryModel = mongoose.model("categories", categorySchema)


module.exports = categoryModel;