const app = require("express").Router();
const tagController = require("../../controllers/seller/tag.controller")
const { createTagValidation } = require("../../validations/tag.validation")
const validator = require("../../helpers/validation.helper")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", tagController.listTags);
app.get("/get", tagController.getTag);
app.post("/create", checkIdentity("requestedBy"), validator(createTagValidation), tagController.createTag);

module.exports = app
