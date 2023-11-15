const app = require("express").Router();
const customerController = require("../../controllers/customer/customer.controller")
const { updateCustomerValidation, resetPasswordValidation } = require("../../validations/customer.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.put("/update", checkIdentity("customer"), validator(updateCustomerValidation), customerController.updateCustomer);
app.put("/password", checkIdentity("customer"), validator(resetPasswordValidation), customerController.resetPassword);
app.delete("/remove", checkIdentity("customer"), customerController.removeCustomer);

app.get("/get", checkIdentity("customer"), customerController.getCustomer);

app.post("/image", checkIdentity("customer"), uploadedFiles.array('image', 1), customerController.uploadImage)
app.delete("/image", checkIdentity("customer"), customerController.deleteImage)


module.exports = app
