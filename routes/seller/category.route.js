const app = require("express").Router();
const categoryController = require("../../controllers/seller/category.controller")
const { createCategoryValidation } = require("../../validations/category.validation")
const validator = require("../../helpers/validation.helper")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", categoryController.listCategories);
app.get("/get", categoryController.getCategory);
app.post("/create", checkIdentity("requestedBy"), validator(createCategoryValidation), categoryController.createCategory);


module.exports = app
