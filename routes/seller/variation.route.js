const app = require("express").Router();
const variationController = require("../../controllers/seller/variation.controller")
const { createVariationValidation, updateVariationValidation } = require("../../validations/variation.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", variationController.listVariations);
app.get("/get", variationController.getVariation);

app.post("/create", checkIdentity("seller"), validator(createVariationValidation), variationController.createVariation);
app.put("/update", checkIdentity("seller"), validator(updateVariationValidation), variationController.updateVariation);
app.delete("/remove", checkIdentity("seller"), variationController.removeVariation);

app.post("/image", checkIdentity("seller"), uploadedFiles.array('images', 1), variationController.uploadImages)
app.delete("/image", checkIdentity("seller"), variationController.deleteImages)


module.exports = app
