const app = require("express").Router();
const roomController = require("../../controllers/admin/room.controller")
const { uploadImagesToMemory } = require("../../helpers/uploader.helper")
const uploadedFiles = uploadImagesToMemory()

app.get("/list", roomController.listRooms);
app.get("/get", roomController.getRoom);
app.post("/file", uploadedFiles.array('file', 1), roomController.uploadFile)

app.put("/update", roomController.updateRoom);
app.delete("/remove", roomController.removeRoom);




module.exports = app
