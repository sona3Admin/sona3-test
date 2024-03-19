const app = require("express").Router();
const roomController = require("../../controllers/admin/room.controller")


app.get("/list", roomController.listRooms);
app.get("/get", roomController.getRoom);

app.put("/update", roomController.updateRoom);
app.delete("/remove", roomController.removeRoom);




module.exports = app
