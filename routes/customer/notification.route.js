const app = require("express").Router();
const notificationController = require("../../controllers/customer/notification.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", notificationController.listNotifications);
app.get("/get", notificationController.getNotification);


module.exports = app
