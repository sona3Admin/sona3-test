const app = require("express").Router();
const shopController = require("../../controllers/customer/shop.controller")


app.get("/get", shopController.getShop);
app.get("/list", shopController.listShops);


module.exports = app
