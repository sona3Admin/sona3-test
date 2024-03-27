let mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    admin: { type: mongoose.Types.ObjectId, ref: "admins" },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    receivers: [{ type: mongoose.Schema.Types.ObjectId }],
    deviceTokens: [{ type: String }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId }],
    title: { type: String },
    body: { type: String },
    image: { type: Object },
    link: { type: String },
    redirectId: { type: mongoose.Schema.Types.ObjectId },
    redirectType: { type: String, enum: ["room", "order", "serviceRequest"] },
    timestamp: { type: Date, default: Date.now() },
    startDate: { type: Date },
    endDate: { type: Date },
    reach: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    type: { type: String, enum: ["admin", "message", "serviceRequest", "order"] },
});


let notificationModel = mongoose.model("notifications", notificationSchema)


module.exports = notificationModel;