const app = require("express").Router();
const roomController = require("../../controllers/seller/room.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.get("/list", checkIdentity("seller"), roomController.listRooms);
app.get("/get", checkIdentity("seller"), roomController.getRoom);
app.post("/file", uploadedFiles.array('file', 1), roomController.uploadFile)


module.exports = app
