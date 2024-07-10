const app = require("express").Router();
const orderController = require("../../controllers/customer/order.controller")
const cartOrderController = require("../../controllers/customer/order/cart.controller")
const basketOrderController = require("../../controllers/customer/order/basket.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.post("/cart", checkIdentity("customer"), cartOrderController.createOrder);
app.delete("/cart", checkIdentity("customer"), cartOrderController.returnSubOrder);

app.post("/basket", checkIdentity("customer"), basketOrderController.createOrder);
app.delete("/basket", checkIdentity("customer"), basketOrderController.returnSubOrder);
app.patch("/basket", checkIdentity("customer"), basketOrderController.cancelSubOrder);

app.put("/update", checkIdentity("customer"), orderController.updateOrder);

app.get("/list", checkIdentity("customer"), orderController.listOrders);
app.get("/get", checkIdentity("customer"), orderController.getOrder);
app.get("/status", checkIdentity("customer"), orderController.getOrderShipmentLastStatus);


module.exports = app
