const app = require("express").Router();
const sellerController = require("../../controllers/admin/seller.controller")
const { createSellerValidation, updateSellerValidation, resetPasswordValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")

const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.post("/create", validator(createSellerValidation), sellerController.createSeller)
app.put("/update", validator(updateSellerValidation), sellerController.updateSeller);
app.put("/password", validator(resetPasswordValidation), sellerController.resetPassword);
app.delete("/remove", sellerController.removeSeller);

app.get("/get", sellerController.getSeller);
app.get("/list", sellerController.listSellers);

app.post("/image", uploadedFiles.array('image', 1), sellerController.uploadImage)
app.delete("/image", sellerController.deleteImage)

app.post("/identity", uploadedFiles.array('image', 2), sellerController.uploadIdentityImages)
app.delete("/identity", sellerController.deleteIdentityImages)

module.exports = app
