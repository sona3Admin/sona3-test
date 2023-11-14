const app = require("express").Router();
const formController = require("../../controllers/seller/form.controller")
const { createFormValidation } = require("../../validations/form.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createFormValidation), formController.createForm);
app.get("/list", formController.listForms);
app.get("/get", formController.getForm);


module.exports = app
