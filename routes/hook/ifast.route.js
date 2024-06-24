const app = require("express").Router();
const ifastController = require("../../hooks/ifast.hook")
const multer = require('multer');
const upload = multer();

app.post("/status", upload.none(), ifastController.updateOrderShipmentStatus)


module.exports = app
