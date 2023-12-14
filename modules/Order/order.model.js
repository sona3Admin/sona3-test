const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    shops: [{ type: mongoose.Types.ObjectId, ref: "shops" }],
    products: [{ type: mongoose.Types.ObjectId, ref: "products" }],
    variations: [{ type: mongoose.Types.ObjectId, ref: "variations" }],
    subOrders: [{
        shop: { type: mongoose.Types.ObjectId, ref: "shops" },
        items: [{
            product: { type: Object },
            variation: { type: Object },
            quantity: { type: Number, min: 1 },
            itemTotal: { type: Number, min: 0 }
        }],
        shopTotal: { type: Number, min: 0 },
        shopOriginalTotal: { type: Number, min: 0 },
        shopTaxes: { type: Number, min: 0 },
        shopShippingFees: { type: Number, min: 0 },
        subOrderTotal: { type: Number, min: 0 },
        subOrderDeliveryDate: { type: Date },
        subOrderStatus: {
            type: String,
            enum: ["pending", "in progress", "delivered"],
            default: "pending"
        }
    }],
    status: {
        type: String,
        enum: ["pending", "in progress", "delivered", "canceled"],
        default: "pending"
    },
    shippingAddress: {
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        address: { type: Object }
    },
    paymentMethod: { type: String, enum: ["cashOnDelivery", "visa", "others"], default: "cashOnDelivery" },
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
    cartTotal: { type: Number, min: 0 },
    cartOriginalTotal: { type: Number, min: 0, default: 0 },
    shippingFeesTotal: { type: Number, min: 0 },
    taxesTotal: { type: Number, min: 0 },
    taxesRate: { type: Number, min: 0 },
    orderTotal: { type: Number, min: 0 },
    issueDate: { type: Date },

})


const orderModel = mongoose.model("orders", orderSchema)


module.exports = orderModel;