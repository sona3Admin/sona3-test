const app = require("express").Router();
const reportController = require("../../controllers/admin/report.controller")


app.post("/countCustomers", reportController.countCustomers);
app.post("/countSellers", reportController.countSellers);
app.get("/countTiers", reportController.countSellersBasedOnTiers);
app.post("/countShops", reportController.countShops);
app.post("/countProducts", reportController.countProducts);
app.post("/countServices", reportController.countServices);
app.get("/shippingInvoice", reportController.calculateShippingInvoice);
app.get("/sellersInvoices", reportController.calculateSellersInvoices);
app.get("/listSellersWithOrderSummary", reportController.listSellersWithOrderSummary);
app.get("/listSellersWithServicesRequestSummary", reportController.listSellersWithServicesRequestSummary);


module.exports = app
