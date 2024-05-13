let mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    admin: { type: mongoose.Types.ObjectId, ref: "admins" },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    receivers: [{ type: mongoose.Schema.Types.ObjectId }],
    toAdmin: { type: Boolean, default: false },
    toAll: { type: Boolean, default: false },
    toAllCustomers: { type: Boolean, default: false },
    toAllSellers: { type: Boolean, default: false },
    deviceTokens: [{ type: String }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId }],
    titleEn: { type: String },
    titleAr: { type: String },
    bodyEn: { type: String },
    bodyAr: { type: String },
    image: { type: Object },
    link: { type: String },
    redirectId: { type: mongoose.Schema.Types.ObjectId },
    redirectType: { type: String, enum: ["room", "order", "serviceRequest", "shop", "product", "seller", "service"] },
    timestamp: { type: Date, default: Date.now() },
    startDate: { type: Date },
    endDate: { type: Date },
    reach: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    type: { type: String, enum: ["admin", "message", "serviceRequest", "servicePriceUpdate", "order", "activate", "deactivate", "changeData", "creation"] },
});


let notificationModel = mongoose.model("notifications", notificationSchema)


module.exports = notificationModel;