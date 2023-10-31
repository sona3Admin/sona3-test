const app = require("express").Router();
const authController = require("../../controllers/seller/auth.controller")
const { createSellerValidation, loginValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")


app.post("/register", validator(createSellerValidation), authController.register);
app.post("/login", validator(loginValidation), authController.login);




module.exports = app
