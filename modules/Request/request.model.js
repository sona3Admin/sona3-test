const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    service: { type: mongoose.Types.ObjectId, ref: "services" },
    fields: [{
        _id: { type: mongoose.Types.ObjectId, ref: "fields" },
        field: { type: Object },
        value: {}
    }],
    
    status: {
        type: String,
        enum: ["pending", "canceled", "accepted", "rejected", "purchased", "to be returned", "returned"],
        default: "pending"
    },

    serviceTotal: { type: Number, min: 0 },
    taxesTotal: { type: Number, min: 0 },
    taxesRate: { type: Number, min: 0 },
    orderTotal: { type: Number, min: 0 },
    paymentMethod: { type: String, enum: ["cashOnDelivery", "visa"], default: "visa" },
    issueDate: { type: Date },
    deliveryDate: { type: Date },
    requestNotes: { type: String }
})


const requestModel = mongoose.model("requests", requestSchema)


module.exports = requestModel;