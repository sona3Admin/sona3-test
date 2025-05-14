const app = require("express").Router();
const firstFlightController = require("../../mocks/firstFlight.mock")


app.post("/createOrder", firstFlightController.createNewBulkOrder)
app.post("/pickup", firstFlightController.createNewPickupRequest)
app.post("/print", firstFlightController.printLabel)
app.get("/cities", firstFlightController.listCities)
app.post("/status", firstFlightController.updateOrderShipmentStatus)


module.exports = app
