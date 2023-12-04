const app = require("express").Router();
const orderController = require("../../controllers/seller/order.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.put("/update", checkIdentity("seller"), orderController.updateOrder);

app.get("/list", checkIdentity("seller"), orderController.listOrders);
app.get("/get", checkIdentity("seller"), orderController.getOrder);


module.exports = app
