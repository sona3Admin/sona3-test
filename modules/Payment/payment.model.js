const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    lang: { type: String, enum: ["en", "ar"] },
    session: { type: String },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shippingAddress: { type: Object },
    shippingCost: { type: Object },
    orderCost: { type: Object },
    orderDetails: { type: Object },
    orderType: { type: String, enum: ["cart", "basket", "request", "subscription"] },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    tier: { type: String, enum: ["basic", "pro", "advanced", "lifetime"] },
    tierDuration: { type: String, enum: ["month", "year"] },
    subscriptionFees: { type: Number },
    freeTrialApplied: { type: Boolean },
    payedInitialFees: { type: Boolean },
    timestamp: { type: Date, default: Date.now() }
})


const paymentModel = mongoose.model("payments", paymentSchema)


module.exports = paymentModel;