const app = require("express").Router();
const shopController = require("../../controllers/seller/shop.controller")
const { createShopValidation, updateShopValidation } = require("../../validations/shop.validation")
const validator = require("../../helpers/validation.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/get", shopController.getShop);
app.get("/list", shopController.listShops);

app.post("/create", checkIdentity("seller"), validator(createShopValidation), shopController.createShop);
app.put("/update", checkIdentity("seller"), validator(updateShopValidation), shopController.updateShop);
app.delete("/remove", checkIdentity("seller"), shopController.removeShop);

app.post("/image", checkIdentity("seller"), uploadedFiles.array('image', 1), shopController.uploadImage)
app.delete("/image", checkIdentity("seller"), shopController.deleteImage)

app.post("/cover", checkIdentity("seller"), uploadedFiles.array('covers', 10), shopController.uploadCovers)
app.delete("/cover", checkIdentity("seller"), shopController.deleteCovers)

app.post("/banner", checkIdentity("seller"), uploadedFiles.array('banners', 10), shopController.uploadBanners)
app.delete("/banner", checkIdentity("seller"), shopController.deleteBanners)



module.exports = app
