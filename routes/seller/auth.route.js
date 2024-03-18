const app = require("express").Router();
const authController = require("../../controllers/seller/auth.controller")
const sellerController = require("../../controllers/seller/seller.controller")
const { createSellerValidation, loginValidation, updateSellerValidation, authenticateBySocialMediaValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["seller"]


app.post("/register", validator(createSellerValidation), authController.register);
app.post("/login", validator(loginValidation), authController.login);
app.post("/social", validator(authenticateBySocialMediaValidation), authController.authenticateBySocialMediaAccount)
app.post("/identity", checkToken(allowedUsers), uploadedFiles.array('image', 2), sellerController.uploadIdentityImages)
app.delete("/identity", checkToken(allowedUsers), sellerController.deleteIdentityImages)
app.put("/verify", checkToken(allowedUsers), validator(updateSellerValidation), sellerController.updateSeller)




module.exports = app
