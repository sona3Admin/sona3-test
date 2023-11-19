const app = require("express").Router();
const bannerController = require("../../controllers/customer/banner.controller")


app.get("/list", bannerController.listBanners);
app.get("/get", bannerController.getBanner);

module.exports = app
