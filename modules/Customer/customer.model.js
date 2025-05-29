const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const customerSchema = mongoose.Schema({
    name: { type: String, default: "No Name" },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    image: { type: Object },
    // location: {
    //     type: { type: String, default: "Point" },
    //     coordinates: { type: Array, default: [0, 0] }
    // },
    // address: { type: Object },
    addresses: [{
        name: { type: String },
        emirate: { type: mongoose.Types.ObjectId, ref: "cities" },
        country: { type: String },
        street: { type: String},
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        isDefault: { type: Boolean, default: false },
        city: { type: mongoose.Types.ObjectId },
        remarks: { type: String , required: false }
    }],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    joinDate: { type: Date, default: Date.now },
    verifyDate: { type: Date },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    cashback: { type: Number, default: 0, min: 0 },
    hasPurchased: { type: Boolean, default: false },
    birthDate: { type: Date },
    fcmToken: { type: String },
    token: { type: String },
    session: { type: Object }
})

customerSchema.pre("save", async function (next) {
    if (this.password) this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

customerSchema.index({ location: '2dsphere' });
customerSchema.index({ email: 1 });

const customerModel = mongoose.model("customers", customerSchema)


module.exports = customerModel;