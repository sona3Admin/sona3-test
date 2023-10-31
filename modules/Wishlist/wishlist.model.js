const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: "customers", required: true },
    items: [{ type: mongoose.Types.ObjectId, ref: "products" }]
})


const wishlistModel = mongoose.model("wishlists", wishlistSchema)


module.exports = wishlistModel;