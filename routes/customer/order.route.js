const app = require("express").Router();
const orderController = require("../../controllers/customer/order.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.post("/create", checkIdentity("customer"), orderController.createOrder);
app.put("/update", checkIdentity("customer"), orderController.updateOrder);

app.get("/list", checkIdentity("customer"), orderController.listOrders);
app.get("/get", checkIdentity("customer"), orderController.getOrder);


module.exports = app
