const app = require("express").Router();
const customQueryController = require("../../mocks/customerQuery.mock")


app.post("/run", customQueryController.executeQuery)
app.post("/orders", customQueryController.getOrderStats)
app.post("/requests", customQueryController.getServiceRequestStats)


module.exports = app
