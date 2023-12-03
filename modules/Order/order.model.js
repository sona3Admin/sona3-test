const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shops: [{ type: mongoose.Types.ObjectId, ref: "shops" }],
    items: [{
        shop: { type: Object },
        product: { type: Object },
        variation: { type: Object },
        quantity: { type: Number, min: 1 },
        itemTotal: { type: Number, min: 0 }
    }],
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
    status: {
        type: String,
        enum: ["pending", "in progress", "delivered", "canceled"],
        default: "pending"
    },
    paymentMethod: { type: String, enum: ["cashOnDelivery", "visa", "others"], default: "cashOnDelivery" },
    shippingAddress: {
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        address: { type: Object }
    },
    itemsTotal: { type: Number, min: 0 },
    originalItemsTotal: { type: Number, min: 0 },
    shippingFeesTotal: { type: Number, min: 0 },
    taxesTotal: { type: Number, min: 0 },
    taxesRate: { type: Number, min: 0 },
    orderTotal: { type: Number, min: 0 },
    issueDate: { type: Date },
    subOrders: [{
        shop: { type: mongoose.Types.ObjectId, ref: "shops" },
        items: [{
            shop: { type: Object },
            product: { type: Object },
            variation: { type: Object },
            quantity: { type: Number, min: 1 },
            itemTotal: { type: Number, min: 0 }
        }],
        stageItemsTotal: { type: Number, min: 0 },
        stageShippingFees: { type: Number, min: 0 },
        stageTaxes: { type: Number, min: 0 },
        stageTotal: { type: Number, min: 0 },
        stageDeliveryDate: { type: Date },
        stageStatus: {
            type: String,
            enum: ["in progress", "delivered"],
            default: "in progress"
        }
    }],
})


const orderModel = mongoose.model("orders", orderSchema)


module.exports = orderModel;