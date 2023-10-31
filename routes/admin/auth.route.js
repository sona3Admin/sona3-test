const app = require("express").Router();
const authController = require("../../controllers/admin/auth.controller")
const { loginValidation } = require("../../validations/admin.validation")
const validator = require("../../helpers/validation.helper")


app.post("/login", validator(loginValidation), authController.login);




module.exports = app
