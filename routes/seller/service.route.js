const app = require("express").Router();
const serviceController = require("../../controllers/seller/service.controller")
const { createServiceValidation, updateServiceValidation } = require("../../validations/service.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", serviceController.listServices);
app.get("/get", serviceController.getService);

app.post("/create", checkIdentity("seller"), validator(createServiceValidation), serviceController.createService);
app.put("/update", checkIdentity("seller"), validator(updateServiceValidation), serviceController.updateService);
app.delete("/remove", checkIdentity("seller"), serviceController.removeService);

app.post("/image", checkIdentity("seller"), uploadedFiles.array('images', 10), serviceController.uploadImages)
app.delete("/image", checkIdentity("seller"), serviceController.deleteImages)


module.exports = app
