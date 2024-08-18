const app = require("express").Router();
const serviceController = require("../../controllers/admin/service.controller")
const { createServiceValidation, updateServiceValidation } = require("../../validations/service.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()


app.get("/list", serviceController.listServices);
app.get("/count", serviceController.countServices);
app.get("/get", serviceController.getService);

app.post("/create", validator(createServiceValidation), serviceController.createService);
app.put("/update", validator(updateServiceValidation), serviceController.updateService);
app.delete("/remove", serviceController.removeService);

app.post("/image", uploadedFiles.array('images', 10), serviceController.uploadImages)
app.delete("/image", serviceController.deleteImages)


module.exports = app
