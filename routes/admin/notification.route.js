const app = require("express").Router();
const notificationController = require("../../controllers/admin/notification.controller")


app.post("/create", notificationController.createNotification)
app.get("/list", notificationController.listNotifications);
app.get("/get", notificationController.getNotification);

app.put("/update", notificationController.updateNotification);
app.delete("/remove", notificationController.removeNotification);




module.exports = app
