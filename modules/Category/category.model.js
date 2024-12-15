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
    parentCategory: { type: mongoose.Types.ObjectId, ref: "categories", default: null },
    creationDate: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
})

categorySchema.index({ nameEn: 1 });
categorySchema.index({ nameAr: 1 });


const categoryModel = mongoose.model("categories", categorySchema)


module.exports = categoryModel;