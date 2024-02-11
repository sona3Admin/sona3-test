const app = require("express").Router();
const basketController = require("../../controllers/customer/basket.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")

app.get("/get", checkIdentity("customer"), basketController.getBasket);

app.post("/item", checkIdentity("customer"), basketController.addItemToBasket);
app.delete("/item", checkIdentity("customer"), basketController.removeItemFromBasket);
app.delete("/flush", checkIdentity("customer"), basketController.flushBasket);



module.exports = app
