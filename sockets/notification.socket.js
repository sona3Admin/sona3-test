const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { createNotificationValidation } = require("../validations/notification.validation")
const { socketValidator } = require("../helpers/socketValidation.helper")


exports.notificationSocketHandler = (socket, io, socketId, localeMessages, language) => {

    socket.on("sendNotificationToGroup", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            
            let validator = await socketValidator(createNotificationValidation, dataObject, language)
            if (!validator.success) return sendAck(validator)

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
            notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

        }
    })
}