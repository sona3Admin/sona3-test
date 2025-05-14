const app = require("express").Router();
const alertController = require("../../controllers/admin/alert.controller")

app.get("/list", alertController.listAlerts);
app.delete("/remove", alertController.removeAlert);

module.exports = app
