const app = require("express").Router();
const fieldController = require("../../controllers/seller/field.controller")
const { createFieldValidation } = require("../../validations/field.validation")
const validator = require("../../helpers/validation.helper")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", fieldController.listFields);
app.get("/get", fieldController.getField);
app.post("/create", checkIdentity("requestedBy"), validator(createFieldValidation), fieldController.createField);


module.exports = app
