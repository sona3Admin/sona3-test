const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
    name: { type: String },
    image: { type: Object }
})


const bannerModel = mongoose.model("banners", bannerSchema)


module.exports = bannerModel;