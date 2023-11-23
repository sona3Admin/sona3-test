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
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: Array, default: [0, 0] }
        },
        address: { type: Object }
    }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinDate: { type: Date },
    token: { type: String },
    session: { type: Object }
})

customerSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

const customerModel = mongoose.model("customers", customerSchema)


module.exports = customerModel;