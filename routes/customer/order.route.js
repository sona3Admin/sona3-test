const app = require("express").Router();
const orderController = require("../../controllers/customer/order.controller")
const cartOrderController = require("../../controllers/customer/order/cart.controller")
const basketOrderController = require("../../controllers/customer/order/basket.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")
const { createOrderValidation } = require("../../validations/order.validation")
const validator = require("../../helpers/validation.helper")

app.post("/cart", checkIdentity("customer"), validator(createOrderValidation), cartOrderController.createOrder);
app.post("/basket", checkIdentity("customer"), validator(createOrderValidation), basketOrderController.createOrder);

app.put("/update", checkIdentity("customer"), orderController.updateOrder);

app.get("/list", checkIdentity("customer"), orderController.listOrders);
app.get("/get", checkIdentity("customer"), orderController.getOrder);
app.get("/status", checkIdentity("customer"), orderController.getOrderShipmentLastStatus);
app.get("/total", checkIdentity("customer"), orderController.calculateOrderTotal);


module.exports = app
