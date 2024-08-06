const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    session: { type: String },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shippingAddress: { type: Object },
    shippingCost: { type: Object },
    orderCost: { type: Object },
    orderDetails: { type: Object },
    orderType: { type: String, enum: ["cart", "basket", "request", "subscription"], default: "cart" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    tier: { type: String, enum: ["basic", "pro", "advanced", "lifetime"] },
    tierDuration: { type: String, enum: ["month", "year"] },
    subscriptionFees: { type: Number },
    timestamp: { type: Date, default: Date.now() }
})


const paymentModel = mongoose.model("payments", paymentSchema)


module.exports = paymentModel;