const app = require("express").Router();
const formController = require("../../controllers/seller/form.controller")
const { createFormValidation } = require("../../validations/form.validation")
const validator = require("../../helpers/validation.helper")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", formController.listForms);
app.get("/get", formController.getForm);
app.post("/create", checkIdentity("requestedBy"), validator(createFormValidation), formController.createForm);


module.exports = app
