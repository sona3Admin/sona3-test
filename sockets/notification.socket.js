const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")


exports.notificationSocketHandler = (socket, io, socketId, localeMessages) => {

    socket.on("sendNotificationToGroup", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");

            let resultObject = await notificationRepo.create(dataObject)
            resultObject.result.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            })
            notificationHelper.sendPushNotification(resultObject.result.title, resultObject.result.body, resultObject.result.deviceTokens)
            return sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

        }
    })
}