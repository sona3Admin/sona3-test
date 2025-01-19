const app = require("express").Router();
const reportController = require("../../controllers/seller/report.controller")


app.get("/products", reportController.countProducts);
app.get("/services", reportController.countServices);




app.get("/order", reportController.countOrders);
app.get("/request", reportController.countRequests);


module.exports = app
