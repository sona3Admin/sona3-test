const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { getSettings } = require("../helpers/settings.helper")


exports.notificationSocketHandler = (socket, io, socketId, localeMessages) => {

    socket.on("joinAdminsRoom", (dataObject, sendAck) => {
        const adminId = dataObject._id
        const adminsRoomId = getSettings("adminsRoomId")
        socket.join(adminsRoomId.toString())
        return sendAck({ success: true, code: 200 })
    })


    socket.on("sendNotificationToGroup", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");

            let resultObject = await notificationRepo.create(dataObject)
            resultObject.result.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newMessageNotification", { success: true, code: 201, result: resultObject.result })
            })
            notificationHelper.sendPushNotification(resultObject.result.title, resultObject.result.body, resultObject.result.deviceTokens)
            sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

        }
    })
}