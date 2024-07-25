const app = require("express").Router();
const firstFlightController = require("../../mocks/firstFlight.mock")


app.post("/createOrder", firstFlightController.createNewBulkOrder)
app.post("/pickup", firstFlightController.createNewPickupRequest)
app.get("/cities", firstFlightController.listCities)


module.exports = app
