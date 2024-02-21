const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const customerSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, drobDups: true },
    password: { type: String },
    phone: { type: String },
    image: { type: Object },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: Array, default: [0, 0] }
    },
    address: { type: Object },
    savedLocations: [{
        name: { type: String },
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        address: { type: Object }
    }],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinDate: { type: Date },
    verifyDate: { type: Date },
    token: { type: String },
    session: { type: Object },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    cashback: { type: Number, default: 0, min: 0 },
    hasPurchased: { type: Boolean, default: false },
    birthDate: { type: Date }
})

customerSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

customerSchema.index({ location: '2dsphere' });

const customerModel = mongoose.model("customers", customerSchema)


module.exports = customerModel;