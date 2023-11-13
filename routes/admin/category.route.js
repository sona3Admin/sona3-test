const app = require("express").Router();
const categoryController = require("../../controllers/admin/category.controller")
const { createCategoryValidation, updateCategoryValidation } = require("../../validations/category.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.post("/create", validator(createCategoryValidation), categoryController.createCategory);
app.put("/update", validator(updateCategoryValidation), categoryController.updateCategory);
app.delete("/remove", categoryController.removeCategory);

app.get("/list", categoryController.listCategories);
app.get("/get", categoryController.getCategory);

app.post("/image", uploadedFiles.array('image', 1), categoryController.uploadImage)
app.delete("/image", categoryController.deleteImage)

module.exports = app
