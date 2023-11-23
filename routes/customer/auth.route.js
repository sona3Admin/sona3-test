const app = require("express").Router();
const authController = require("../../controllers/customer/auth.controller")
const { createCustomerValidation, loginValidation } = require("../../validations/customer.validation")
const validator = require("../../helpers/validation.helper")


app.post("/register", validator(createCustomerValidation), authController.register);
app.post("/login", validator(loginValidation), authController.login);
app.post("/guest", authController.loginAsGuest);



module.exports = app
