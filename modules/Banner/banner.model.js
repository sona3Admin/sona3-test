const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
    name: { type: String },
    image: { type: Object },
    createdAt: { type: Date, default: Date.now() },
})


const bannerModel = mongoose.model("banners", bannerSchema)


module.exports = bannerModel;