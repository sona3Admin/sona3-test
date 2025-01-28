const app = require("express").Router();
const s3Controller = require("../../mocks/s3.mock")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.post("/upload", uploadedFiles.array('image', 10), s3Controller.uploadImage)
app.delete("/remove", s3Controller.deleteImages)
app.get("/assets", s3Controller.listAssets)

module.exports = app
