const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    creationDate: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
})


const tagModel = mongoose.model("tags", tagSchema)


module.exports = tagModel;