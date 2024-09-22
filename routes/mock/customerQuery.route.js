const app = require("express").Router();
const customQueryController = require("../../mocks/customerQuery.mock")


app.post("/run", customQueryController.executeQuery)


module.exports = app
