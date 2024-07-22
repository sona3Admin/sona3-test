const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    session: { type: String },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shippingAddress: { type: Object },
    shippingCost: { type: Object },
    orderCost: { type: Object },
    orderDetails: { type: Object },
    orderType: { type: String, enum: ["cart", "basket", "request"], default: "cart" }
})


const paymentModel = mongoose.model("payments", paymentSchema)


module.exports = paymentModel;