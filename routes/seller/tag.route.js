const app = require("express").Router();
const tagController = require("../../controllers/seller/tag.controller")
const { createTagValidation } = require("../../validations/tag.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createTagValidation), tagController.createTag);
app.get("/list", tagController.listTags);
app.get("/get", tagController.getTag);


module.exports = app
