const app = require("express").Router();
const firstFlightController = require("../../mocks/firstFlight.mock")


app.post("/createOrder", firstFlightController.createNewBulkOrder)
app.get("/cities", firstFlightController.listCities)


module.exports = app
