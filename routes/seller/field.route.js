const app = require("express").Router();
const fieldController = require("../../controllers/seller/field.controller")
const { createFieldValidation } = require("../../validations/field.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createFieldValidation), fieldController.createField);
app.get("/list", fieldController.listFields);
app.get("/get", fieldController.getField);


module.exports = app
