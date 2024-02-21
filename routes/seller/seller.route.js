const app = require("express").Router();
const sellerController = require("../../controllers/seller/seller.controller")
const { updateSellerValidation, resetPasswordValidation } = require("../../validations/seller.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.put("/update", checkIdentity("_id"), validator(updateSellerValidation), sellerController.updateSeller);
app.put("/password", checkIdentity("_id"), validator(resetPasswordValidation), sellerController.resetPassword);
app.delete("/remove", checkIdentity("_id"), sellerController.removeSeller);

app.get("/get", checkIdentity("_id"), sellerController.getSeller);

app.post("/image", checkIdentity("_id"), uploadedFiles.array('image', 1), sellerController.uploadImage)
app.delete("/image", checkIdentity("_id"), sellerController.deleteImage)

app.post("/identity", checkIdentity("_id"), uploadedFiles.array('image', 2), sellerController.uploadIdentityImages)
app.delete("/identity", checkIdentity("_id"), sellerController.deleteIdentityImages)


module.exports = app
