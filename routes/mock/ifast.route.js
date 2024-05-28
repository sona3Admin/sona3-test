const app = require("express").Router();
const ifastController = require("../../mocks/ifast.mock")


app.get("/token", ifastController.getIfastToken);
app.post("/createOrder", ifastController.createNewBulkOrder)
app.post("/getShipmentStatus", ifastController.getOrderShipmentLastStatus)


module.exports = app
