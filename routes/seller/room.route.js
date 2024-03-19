const app = require("express").Router();
const roomController = require("../../controllers/seller/room.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", checkIdentity("seller"), roomController.listRooms);
app.get("/get", checkIdentity("seller"), roomController.getRoom);


module.exports = app
