const app = require("express").Router();
const roomController = require("../../controllers/customer/room.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.get("/list", checkIdentity("customer"), roomController.listRooms);
app.get("/get", checkIdentity("customer"), roomController.getRoom);
app.post("/file", uploadedFiles.array('file', 1), roomController.uploadFile)


module.exports = app
