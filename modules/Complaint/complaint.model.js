const mongoose = require("mongoose");

const complaintSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    body: { type: String, required: true },
    creationDate: { type: Date, default: Date.now() },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false }
})


const complaintModel = mongoose.model("complaints", complaintSchema)


module.exports = complaintModel;