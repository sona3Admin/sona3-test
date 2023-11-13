const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    isRequested: { type: Boolean, default: false },
    requestedBy: { type: mongoose.Types.ObjectId, ref: "shops" },
    requestDate: { type: Date },
    isActive: { type: Boolean, default: false }
})


const tagModel = mongoose.model("tags", tagSchema)


module.exports = tagModel;