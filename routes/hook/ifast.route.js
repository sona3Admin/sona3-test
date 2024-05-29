const app = require("express").Router();
const ifastController = require("../../hooks/ifast.hook")


app.get("/token", ifastController.generateTokenToIfast);
app.post("/status", ifastController.updateOrderShipmentStatus)


module.exports = app
