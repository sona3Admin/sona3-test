const app = require("express").Router();
const variationController = require("../../controllers/admin/variation.controller")
const { createVariationValidation, updateVariationValidation } = require("../../validations/variation.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()


app.get("/list", variationController.listVariations);
app.get("/get", variationController.getVariation);

app.post("/create", validator(createVariationValidation), variationController.createVariation);
app.put("/update", validator(updateVariationValidation), variationController.updateVariation);
app.delete("/remove", variationController.removeVariation);

app.post("/image", uploadedFiles.array('images', 10), variationController.uploadImages)
app.delete("/image", variationController.deleteImages)


module.exports = app
