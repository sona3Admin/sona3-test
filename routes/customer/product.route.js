const app = require("express").Router();
const productController = require("../../controllers/customer/product.controller")


app.get("/list", productController.listProducts);
app.get("/get", productController.getProduct);


module.exports = app
