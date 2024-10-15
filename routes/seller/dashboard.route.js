const app = require("express").Router();
const dashboardController = require("../../controllers/seller/dashboard.controller")


app.get("/order", dashboardController.countOrders);
app.get("/request", dashboardController.countRequests);


module.exports = app
