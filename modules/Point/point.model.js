const mongoose = require("mongoose");

const pointSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    currentPoints: { type: Number, min: 0, default: 0 },
    usedPoints: { type: Number, min: 0, default: 0 },
    
})


const pointModel = mongoose.model("points", pointSchema)


module.exports = pointModel;