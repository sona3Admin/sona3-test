const app = require("express").Router();
const adminController = require("../../controllers/admin/admin.controller")
const { createAdminValidation, updateAdminValidation, resetPasswordValidation } = require("../../validations/admin.validation")
const validator = require("../../helpers/validation.helper")

const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.post("/create", validator(createAdminValidation), adminController.createAdmin);
app.put("/update", validator(updateAdminValidation), adminController.updateAdmin);
app.put("/password", validator(resetPasswordValidation), adminController.resetPassword);
app.delete("/remove", adminController.removeAdmin);

app.get("/list", adminController.listAdmins);
app.get("/get", adminController.getAdmin);

app.post("/image", uploadedFiles.array('image', 1), adminController.uploadImage)
app.delete("/image", adminController.deleteImage)


module.exports = app
