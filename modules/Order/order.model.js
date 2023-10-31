const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers", required: true },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    items: [{
        product: { type: mongoose.Types.Object, ref: "products" },
        quantity: Number, min: 1,
        itemTotal: Number, min: 0
    }],
    coupon: { type: mongoose.Types.Object, ref: "coupons" },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "in progress", "delivered", "canceled"],
        default: "pending"
    },
    paymentMethod: { type: String, enum: ["cashOnDelivery", "visa", "others"], default: "cashOnDelivery" },
    shippingAddress: { type: Object },
    itemsTotal: { type: Number, min: 0, required: true },
    originalItemsTotal: { type: Number, min: 0, required: true },
    shippingFees: { type: Number, min: 0 },
    taxes: { type: Number, min: 0 },
    orderTotal: { type: Number, min: 0, required: true },
    issueDate: { type: Date, default: Date.now() }
})


const orderModel = mongoose.model("orders", orderSchema)


module.exports = orderModel;