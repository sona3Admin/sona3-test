const mongoose = require("mongoose");

const adSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    description: { type: String },
    image: { type: Object },
    requestDate: { type: Date, default: Date.now() }
})


const adModel = mongoose.model("ads", adSchema)


module.exports = adModel;