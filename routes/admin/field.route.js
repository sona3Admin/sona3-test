const app = require("express").Router();
const fieldController = require("../../controllers/admin/field.controller")
const { createFieldValidation, updateFieldValidation } = require("../../validations/field.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createFieldValidation), fieldController.createField);
app.put("/update", validator(updateFieldValidation), fieldController.updateField);
app.delete("/remove", fieldController.removeField);

app.get("/list", fieldController.listFields);
app.get("/get", fieldController.getField);


module.exports = app
