const app = require("express").Router();
const productController = require("../../controllers/seller/product.controller")
const { createProductValidation, updateProductValidation } = require("../../validations/product.validation")
const validator = require("../../helpers/validation.helper")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", productController.listProducts);
app.get("/get", productController.getProduct);

app.post("/create", checkIdentity("seller"), validator(createProductValidation), productController.createProduct);
app.put("/update", checkIdentity("seller"), validator(updateProductValidation), productController.updateProduct);
app.delete("/remove", checkIdentity("seller"), productController.removeProduct);




module.exports = app
