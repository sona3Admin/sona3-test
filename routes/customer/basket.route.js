const app = require("express").Router();
const basketController = require("../../controllers/customer/basket.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")

app.get("/get", checkIdentity("customer"), basketController.getBasket);

app.post("/item", checkIdentity("customer"), basketController.addItemToBasket);
app.delete("/item", checkIdentity("customer"), basketController.removeItemFromBasket);
app.delete("/flush", checkIdentity("customer"), basketController.flushBasket);

app.post("/cashback", checkIdentity("customer"), basketController.applyCashback)
app.delete("/cashback", checkIdentity("customer"), basketController.redeemCashback)

module.exports = app
