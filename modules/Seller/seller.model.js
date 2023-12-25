const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const sellerSchema = mongoose.Schema({
    userName: { type: String, required: true, dropDups: true },
    email: { type: String, required: true, dropDups: true },
    password: { type: String, required: true },
    phone: { type: String },
    image: { type: Object },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: Array, default: [0, 0] }
    },
    address: { type: Object },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinDate: { type: Date },
    verifyDate: { type: Date },
    token: { type: String },
    session: { type: Object }

})

sellerSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

const sellerModel = mongoose.model("sellers", sellerSchema)


module.exports = sellerModel;