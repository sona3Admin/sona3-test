const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { getSettings } = require("../helpers/settings.helper")
const { createNotificationValidation } = require("../validations/notification.validation")
const { socketValidator } = require("../helpers/socketValidation.helper")


exports.adminSocketHandler = (socket, io, socketId, localeMessages, language) => {

    socket.on("joinAdminsRoom", (sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            const adminsRoomId = getSettings("adminsRoomId")
            socket.join(adminsRoomId.toString())
            return sendAck({ success: true, code: 200 })
        } catch (err) {
            console.log("err.message", err.message)
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })

    socket.on("sendNotificationToGroup", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            console.log("Sending notification");
            let validationResult = await socketValidator(createNotificationValidation, dataObject, language)
            if (!validationResult.success) return sendAck(validationResult)

            let resultObject = await notificationRepo.create(dataObject)
            resultObject.result.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            })
            let title = {
                en: resultObject.result.titleEn,
                ar: resultObject.result.titleAr
            }
            let body = {
                en: resultObject.result.bodyEn,
                ar: resultObject.result.bodyAr
            }
            if (resultObject.result.deviceTokens.length != 0) notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })

}