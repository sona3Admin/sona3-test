const app = require("express").Router();
const roomController = require("../../controllers/customer/room.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", checkIdentity("customer"), roomController.listRooms);
app.get("/get", checkIdentity("customer"), roomController.getRoom);


module.exports = app
