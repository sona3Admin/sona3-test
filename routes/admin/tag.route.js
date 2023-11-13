const app = require("express").Router();
const tagController = require("../../controllers/admin/tag.controller")
const { createTagValidation, updateTagValidation } = require("../../validations/tag.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createTagValidation), tagController.createTag);
app.put("/update", validator(updateTagValidation), tagController.updateTag);
app.delete("/remove", tagController.removeTag);

app.get("/list", tagController.listTags);
app.get("/get", tagController.getTag);


module.exports = app
