const app = require("express").Router();
const cityController = require("../../controllers/customer/city.controller")


app.get("/list", cityController.listCities);


module.exports = app
