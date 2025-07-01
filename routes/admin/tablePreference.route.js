const app = require("express").Router();
const tablePreferenceController = require("../../controllers/admin/tablePreference.controller")
const { createTablePreferenceValidation } = require("../../validations/tablePreference.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createTablePreferenceValidation), tablePreferenceController.createTablePreference);
app.delete("/remove", tablePreferenceController.removeTablePreference);
app.get("/get", tablePreferenceController.getTablePreference);


module.exports = app
