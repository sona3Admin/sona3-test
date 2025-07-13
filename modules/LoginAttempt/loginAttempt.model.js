const mongoose = require("mongoose");

const loginAttemptSchema = mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    attempts: { type: Number, default: 1 },
    lastAttempt: { type: Date, default: Date.now },
    blockedUntil: { type: Date, default: null },

})

loginAttemptSchema.index({ userName: 1 });


const loginAttemptModel = mongoose.model("loginAttempts", loginAttemptSchema)


module.exports = loginAttemptModel;