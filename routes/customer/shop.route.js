const app = require("express").Router();
const shopController = require("../../controllers/customer/shop.controller")


app.get("/get", shopController.getShop);
app.get("/list", shopController.listShops);
app.get("/featured", shopController.listFeaturedShops);
app.get("/banners", shopController.listShopsBanners);


module.exports = app
