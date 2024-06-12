const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    service: { type: mongoose.Types.ObjectId, ref: "services" },
    shipperRef: { type: String },
    shippingId: { type: String },
    fields: [{
        _id: { type: mongoose.Types.ObjectId, ref: "fields" },
        field: { type: Object },
        value: {}
    }],
    shippingAddress: {
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        address: { type: Object }
    },
    requestStatus: { type: String, enum: ["pending", "accepted", "rejected", "canceled", "purchased"], default: "pending" },
    shippingStatus: {
        type: String,
        enum: ["pending", "in progress", "delivered", "canceled"],
        default: "pending"
    },
    serviceTotal: { type: Number, min: 0 },
    taxesTotal: { type: Number, min: 0 },
    taxesRate: { type: Number, min: 0 },
    shippingFeesTotal: { type: Number, min: 0 },
    orderTotal: { type: Number, min: 0 },
    paymentMethod: { type: String, enum: ["cashOnDelivery", "visa", "others"], default: "cashOnDelivery" },
    requestDate: { type: Date },
    deliveryDate: { type: Date },
    requestNotes: { type: String }
})


const requestModel = mongoose.model("requests", requestSchema)


module.exports = requestModel;