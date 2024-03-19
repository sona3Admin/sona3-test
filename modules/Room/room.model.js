const mongoose = require("mongoose");


const roomSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    withAdmin: { type: Boolean, default: false },
    messages: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        customer: { type: mongoose.Types.ObjectId, ref: "customers" },
        seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
        admin: { type: mongoose.Types.ObjectId, ref: "admins" },
        text: String,
        timestamp: Date,
    }],
    lastMessage: { type: Object },
    lastDate: { type: Date, default: Date.now() },
    isBlocked: { type: Boolean, default: false }
})


const roomModel = mongoose.model("rooms", roomSchema)


module.exports = roomModel;