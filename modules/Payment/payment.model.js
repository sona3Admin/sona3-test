const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    sessionId: { type: String },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    customerAddress: { type: Object },
    orderDetails: { type: Object },
    orderCost: { type: Object },
    orderType: { type: String, enum: ["cart", "basket", "request"], default: "cart" }
})


const paymentModel = mongoose.model("payments", paymentSchema)


module.exports = paymentModel;