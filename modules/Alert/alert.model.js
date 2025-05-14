const mongoose = require("mongoose");

const alertSchema = mongoose.Schema({
    destinationEn: { type: String, required: true },
    destinationAr: { type: String, required: true },
    type: { type: String, required: true, enum: ["new", "removed"] },
    source: { type: String, required: true, enum: ["iFast", "firstFlight"] },

})


const alertModel = mongoose.model("alerts", alertSchema)


module.exports = alertModel;