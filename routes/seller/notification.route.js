const app = require("express").Router();
const notificationController = require("../../controllers/seller/notification.controller")


app.get("/list", notificationController.listNotifications);
app.get("/get", notificationController.getNotification);


module.exports = app
