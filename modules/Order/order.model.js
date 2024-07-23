const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    sellers: [{ type: mongoose.Types.ObjectId, ref: "sellers" }],
    shops: [{ type: mongoose.Types.ObjectId, ref: "shops" }],
    products: [{ type: mongoose.Types.ObjectId, ref: "products" }],
    variations: [{ type: mongoose.Types.ObjectId, ref: "variations" }],
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    shipments: [{ type: String }],
    subOrders: [{
        _id: { type: String },
        shippingId: { type: String },
        seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
        shop: { type: mongoose.Types.ObjectId, ref: "shops" },
        items: [{
            product: { type: Object },
            variation: { type: Object },
            quantity: { type: Number, min: 1 },
            itemTotal: { type: Number, min: 0 }
        }],
        coupon: { type: Object },
        shopTotal: { type: Number, min: 0, default: 0 },
        shopOriginalTotal: { type: Number, min: 0, default: 0 },
        shopTaxes: { type: Number, min: 0, default: 0 },
        shopShippingFees: { type: Number, min: 0, default: 0 },
        subOrderTotal: { type: Number, min: 0, default: 0 },
        subOrderDeliveryDate: { type: Date },
        status: {
            type: String,
            enum: ["pending", "canceled", "in progress", "delivered", "to be returned", "returned"],
            default: "pending"
        },
        shippingStatus: { type: String, default: "pending" }
    }],
    // status: {
    //     type: String,
    //     enum: ["pending", "canceled", "in progress", "delivered", "to be returned", "returned"],
    //     default: "pending"
    // },
    shippingAddress: {
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        address: { type: Object }
    },
    paymentMethod: { type: String, enum: ["cashOnDelivery", "visa"], default: "cashOnDelivery" },
    coupon: { type: Object },
    usedCashback: { type: Number, default: 0, min: 0 },
    cartTotal: { type: Number, min: 0, default: 0 },
    cartOriginalTotal: { type: Number, min: 0, default: 0 },
    shippingFeesTotal: { type: Number, min: 0, default: 0 },
    taxesTotal: { type: Number, min: 0, default: 0 },
    taxesRate: { type: Number, min: 0, default: 0 },
    orderTotal: { type: Number, min: 0, default: 0 },
    issueDate: { type: Date, default: Date.now() },

})


const orderModel = mongoose.model("orders", orderSchema)


module.exports = orderModel;