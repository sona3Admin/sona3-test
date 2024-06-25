const app = require("express").Router();
const ifastController = require("../../hooks/ifast.hook")


app.post("/status", ifastController.updateOrderShipmentStatus)


module.exports = app
