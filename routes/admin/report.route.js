const app = require("express").Router();
const reportController = require("../../controllers/admin/report.controller")


app.post("/countSellers", reportController.countSellers);
app.get("/countTiers", reportController.countSellersBasedOnTiers);



module.exports = app
