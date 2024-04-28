const mongoose = require("mongoose");


const roomSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    withAdmin: { type: Boolean, default: false },
    withCustomer: { type: Boolean, default: false },
    withSeller: { type: Boolean, default: false },
    messages: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        customer: { type: mongoose.Types.ObjectId, ref: "customers" },
        seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
        admin: { type: mongoose.Types.ObjectId, ref: "admins" },
        text: { type: String },
        file: { type: Object },
        timestamp: { type: Date, default: Date.now() },
    }],
    lastMessage: { type: Object },
    lastDate: { type: Date, default: Date.now() },
    isBlocked: { type: Boolean, default: false },
    unreadCount: { type: Number, default: 0, min: 0 }
})


const roomModel = mongoose.model("rooms", roomSchema)


module.exports = roomModel;