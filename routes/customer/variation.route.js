const app = require("express").Router();
const variationController = require("../../controllers/customer/variation.controller")


app.get("/list", variationController.listVariations);
app.get("/get", variationController.getVariation);


module.exports = app
