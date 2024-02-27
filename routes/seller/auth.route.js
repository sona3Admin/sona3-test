const app = require("express").Router();
const authController = require("../../controllers/seller/auth.controller")
const sellerController = require("../../controllers/seller/seller.controller")
const { createSellerValidation, loginValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.post("/register", validator(createSellerValidation), authController.register);
app.post("/login", validator(loginValidation), authController.login);

app.post("/identity", uploadedFiles.array('image', 2), sellerController.uploadIdentityImages)
app.delete("/identity", sellerController.deleteIdentityImages)




module.exports = app
