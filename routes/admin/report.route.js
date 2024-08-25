const app = require("express").Router();
const reportController = require("../../controllers/admin/report.controller")


app.get("/summary", reportController.listSummary);
app.get("/customer", reportController.countCustomers);
app.get("/seller", reportController.countSellers);
app.get("/shop", reportController.countShops);
app.get("/item", reportController.countItems);
app.get("/order", reportController.countOrders);


module.exports = app
