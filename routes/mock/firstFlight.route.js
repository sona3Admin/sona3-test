const app = require("express").Router();
const firstFlightController = require("../../mocks/firstFlight.mock")


app.post("/createOrder", firstFlightController.createNewBulkOrder)


module.exports = app
