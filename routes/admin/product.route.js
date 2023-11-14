const app = require("express").Router();
const productController = require("../../controllers/admin/product.controller")
const { createProductValidation, updateProductValidation } = require("../../validations/product.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createProductValidation), productController.createProduct);
app.put("/update", validator(updateProductValidation), productController.updateProduct);
app.delete("/remove", productController.removeProduct);

app.get("/list", productController.listProducts);
app.get("/get", productController.getProduct);


module.exports = app
