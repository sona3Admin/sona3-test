const app = require("express").Router();
const shopController = require("../../controllers/admin/shop.controller")
const { updateShopValidation } = require("../../validations/shop.validation")
const validator = require("../../helpers/validation.helper")

const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()


app.put("/update", validator(updateShopValidation), shopController.updateShop);
app.delete("/remove", shopController.removeShop);

app.get("/get", shopController.getShop);
app.get("/list", shopController.listShops);

app.post("/image", uploadedFiles.array('image', 1), shopController.uploadImage)
app.delete("/image", shopController.deleteImage)

app.post("/cover", uploadedFiles.array('covers', 10), shopController.uploadCovers)
app.delete("/cover", shopController.deleteCovers)


module.exports = app
