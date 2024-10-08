const app = require("express").Router();
const customerController = require("../../controllers/admin/customer.controller")
const { updateCustomerValidation, resetPasswordValidation } = require("../../validations/customer.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()


app.put("/update", validator(updateCustomerValidation), customerController.updateCustomer);
app.put("/password", validator(resetPasswordValidation), customerController.resetPassword);
app.patch("/updateIsActive", customerController.updateCustomerBlockSate);
app.delete("/remove", customerController.removeCustomer);

app.get("/get", customerController.getCustomer);
app.get("/list", customerController.listCustomers);

app.post("/image", uploadedFiles.array('image', 1), customerController.uploadImage)
app.delete("/image", customerController.deleteImage)


module.exports = app
