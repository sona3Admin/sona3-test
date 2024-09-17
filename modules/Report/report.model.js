const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
    module: { type: String, enum: ["customers", "sellers", "shops", "products", "services", "orders"], required: true },
    timestamp: { type: Date, default: Date.now() },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
})


reportSchema.index({ module: 1 });
reportSchema.index({ timestamp: 1 });
const reportModel = mongoose.model("reports", reportSchema)


module.exports = reportModel;