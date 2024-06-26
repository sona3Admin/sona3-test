const app = require("express").Router();
const orderController = require("../../controllers/admin/order.controller")


app.put("/update", orderController.updateOrder);

app.get("/list", orderController.listOrders);
app.get("/get", orderController.getOrder);
app.get("/status", orderController.getOrderShipmentLastStatus);


module.exports = app
