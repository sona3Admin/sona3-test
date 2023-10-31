const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true }
})


const tagModel = mongoose.model("tags", tagSchema)


module.exports = tagModel;