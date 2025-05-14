const app = require("express").Router();
const cityController = require("../../controllers/admin/city.controller")
const { createCityValidation, addFirstFlightCityValidation, addIfastCityValidation } = require("../../validations/city.validation")
const validator = require("../../helpers/validation.helper")

app.get("/list", cityController.listCities);
app.get("/get", cityController.getCity);
app.post("/create", validator(createCityValidation), cityController.createCity);
app.delete("/remove", cityController.removeCity);
app.post("/addFirstFlightCity", validator(addFirstFlightCityValidation), cityController.addFirstFlightCity);
app.post("/addIfastCity", validator(addIfastCityValidation), cityController.addIfastCity);
app.delete("/removeIfastCity", cityController.removeIfastCity);
app.delete("/removeFirstFlightCity", cityController.removeFirstFlightCity);

module.exports = app
