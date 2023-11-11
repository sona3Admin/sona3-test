const mongoose = require("mongoose");

const adSchema = mongoose.Schema({
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    description: { type: String },
    image: { type: Object },
    requestDate: { type: Date, default: Date.now() }
})


const adModel = mongoose.model("ads", adSchema)


module.exports = adModel;