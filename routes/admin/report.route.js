const app = require("express").Router();
const reportController = require("../../controllers/admin/report.controller")


app.post("/countSellers", reportController.countSellers);



module.exports = app
