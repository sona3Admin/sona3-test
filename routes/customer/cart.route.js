const app = require("express").Router();
const cartController = require("../../controllers/customer/cart.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")

app.get("/get", checkIdentity("customer"), cartController.getCart);

app.post("/item", checkIdentity("customer"), cartController.addItemToCart);
app.delete("/item", checkIdentity("customer"), cartController.removeItemFromCart);



module.exports = app
