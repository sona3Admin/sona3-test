const app = require("express").Router();
const formController = require("../../controllers/admin/form.controller")
const { createFormValidation, updateFormValidation } = require("../../validations/form.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createFormValidation), formController.createForm);
app.put("/update", validator(updateFormValidation), formController.updateForm);
app.delete("/remove", formController.removeForm);

app.get("/list", formController.listForms);
app.get("/get", formController.getForm);


module.exports = app
