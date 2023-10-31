const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers", required: true },
    reviewOn: { type: String, enum: ["seller", "product"], required: true },
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    product: { type: mongoose.Types.ObjectId, ref: "products" },
    reviewText: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewDate: { type: Date, default: Date.now() }
})


const reviewModel = mongoose.model("reviews", reviewSchema)


module.exports = reviewModel;