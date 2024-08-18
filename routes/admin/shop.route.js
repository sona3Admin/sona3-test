const app = require("express").Router();
const shopController = require("../../controllers/admin/shop.controller")
const { createShopValidation, updateShopValidation } = require("../../validations/shop.validation")
const validator = require("../../helpers/validation.helper")

const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()


app.post("/create", validator(createShopValidation), shopController.createShop);
app.put("/update", validator(updateShopValidation), shopController.updateShop);
app.delete("/remove", shopController.removeShop);

app.get("/get", shopController.getShop);
app.get("/list", shopController.listShops);
app.get("/count", shopController.countShops);

app.post("/image", uploadedFiles.array('image', 1), shopController.uploadImage)
app.delete("/image", shopController.deleteImage)

app.post("/cover", uploadedFiles.array('covers', 10), shopController.uploadCovers)
app.delete("/cover", shopController.deleteCovers)

app.post("/banner", uploadedFiles.array('banners', 10), shopController.uploadBanners)
app.delete("/banner", shopController.deleteBanners)

module.exports = app
