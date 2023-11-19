const app = require("express").Router();
const bannerController = require("../../controllers/admin/banner.controller")
const { createBannerValidation, updateBannerValidation } = require("../../validations/banner.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.post("/create", validator(createBannerValidation), bannerController.createBanner);
app.put("/update", validator(updateBannerValidation), bannerController.updateBanner);
app.delete("/remove", bannerController.removeBanner);

app.get("/list", bannerController.listBanners);
app.get("/get", bannerController.getBanner);

app.post("/image", uploadedFiles.array('image', 1), bannerController.uploadImage)
app.delete("/image", bannerController.deleteImage)

module.exports = app
