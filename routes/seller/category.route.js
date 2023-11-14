const app = require("express").Router();
const categoryController = require("../../controllers/seller/category.controller")
const { createCategoryValidation } = require("../../validations/category.validation")
const validator = require("../../helpers/validation.helper")


app.post("/create", validator(createCategoryValidation), categoryController.createCategory);
app.get("/list", categoryController.listCategories);
app.get("/get", categoryController.getCategory);


module.exports = app
