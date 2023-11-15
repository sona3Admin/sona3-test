const app = require("express").Router();
const serviceController = require("../../controllers/admin/service.controller")


app.get("/list", serviceController.listServices);
app.get("/get", serviceController.getService);


module.exports = app
