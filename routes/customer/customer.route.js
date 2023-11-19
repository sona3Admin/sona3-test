const app = require("express").Router();
const customerController = require("../../controllers/customer/customer.controller")
const { updateCustomerValidation, resetPasswordValidation } = require("../../validations/customer.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.put("/update", checkIdentity("_id"), validator(updateCustomerValidation), customerController.updateCustomer);
app.put("/password", checkIdentity("_id"), validator(resetPasswordValidation), customerController.resetPassword);
app.delete("/remove", checkIdentity("_id"), customerController.removeCustomer);

app.get("/get", checkIdentity("_id"), customerController.getCustomer);

app.post("/image", checkIdentity("_id"), uploadedFiles.array('image', 1), customerController.uploadImage)
app.delete("/image", checkIdentity("_id"), customerController.deleteImage)


module.exports = app
