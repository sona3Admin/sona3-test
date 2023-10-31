const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const sellerSchema = mongoose.Schema({
    category: { type: mongoose.Types.ObjectId, ref: "categories" },
    nameEn: { type: String, required: true, dropDups: true },
    nameAr: { type: String, required: true, dropDups: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    email: { type: String, required: true, dropDups: true },
    passwrd: { type: String, required: true },
    phone: { type: String },
    image: { type: Object },
    location: {
        type: "Point",
        coordinates: { type: Array, default: [0, 0] }
    },
    address: { type: Object },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 1 },
    reviewCount: { type: Number, min: 0 },
    joinDate: Date
})

sellerSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

const sellerModel = mongoose.model("sellers", sellerSchema)


module.exports = sellerModel;