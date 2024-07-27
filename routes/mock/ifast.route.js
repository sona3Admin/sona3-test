const app = require("express").Router();
const ifastController = require("../../mocks/ifast.mock")


app.get("/cities", ifastController.listCities)
app.get("/token", ifastController.getIfastToken);
app.post("/createOrder", ifastController.createNewBulkOrder)
app.post("/createReverseOrder", ifastController.createNewReverseOrder)
app.post("/getShipmentStatus", ifastController.getOrderShipmentLastStatus)
app.delete("/cancelShipment", ifastController.cancelOrderShipment)
app.post("/print", ifastController.printLabel);


module.exports = app
