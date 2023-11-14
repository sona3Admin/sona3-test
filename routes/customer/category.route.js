const app = require("express").Router();
const categoryController = require("../../controllers/customer/category.controller")


app.get("/list", categoryController.listCategories);
app.get("/get", categoryController.getCategory);


module.exports = app
