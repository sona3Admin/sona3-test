const app = require("express").Router();
const authController = require("../../controllers/seller/auth.controller")
const sellerController = require("../../controllers/seller/seller.controller")
const { createSellerValidation, sendEmailValidation, loginValidation, updateSellerValidation, authenticateBySocialMediaValidation, verifyEmailUpdateValidation, requestEmailUpdateValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["seller"]


app.post("/register", validator(createSellerValidation), authController.register);
app.post("/login", validator(loginValidation), authController.login);
app.post("/social", validator(authenticateBySocialMediaValidation), authController.authenticateBySocialMediaAccount)
// app.post("/identity", checkToken(allowedUsers), uploadedFiles.array('image', 2), sellerController.uploadIdentityImages)
app.post("/identity", checkToken(allowedUsers), uploadedFiles.array('document', 2), sellerController.uploadIdentityImages)

app.delete("/identity", checkToken(allowedUsers), sellerController.deleteIdentityImages)
app.post("/otp", validator(sendEmailValidation), authController.sendEmailVerificationCode);
app.post("/verify", authController.verifyEmailOTP);
app.put("/verify", checkToken(allowedUsers), validator(updateSellerValidation), sellerController.updateSeller)

app.put("/requestEmailUpdate", checkToken(allowedUsers), validator(requestEmailUpdateValidation), authController.requestEmailUpdate);
app.put("/verifyEmailUpdate", checkToken(allowedUsers), validator(verifyEmailUpdateValidation), authController.verifyEmailUpdateOTP);



module.exports = app
