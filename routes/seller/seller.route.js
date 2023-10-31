const app = require("express").Router();
const sellerController = require("../../controllers/seller/seller.controller")
const { updateSellerValidation, resetPasswordValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")

const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()


app.put("/update", validator(updateSellerValidation), sellerController.updateSeller);
app.put("/password", validator(resetPasswordValidation), sellerController.resetPassword);
app.delete("/remove", sellerController.removeSeller);

app.get("/get", sellerController.getSeller);

app.post("/image", uploadedFiles.array('image', 1), sellerController.uploadImage)
app.delete("/image", sellerController.deleteImage)


module.exports = app
