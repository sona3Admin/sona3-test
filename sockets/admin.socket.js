const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { createNotificationValidation } = require("../validations/notification.validation")
const { socketValidator } = require("../helpers/socketValidation.helper")
const ADMIN_ROOM_ID = "Sona3AdminsRoom"
const CUSTOMER_ROOM_ID = "Sona3CustomersRoom"
const SELLER_ROOM_ID = "Sona3SellersRoom"


exports.adminSocketHandler = (socket, io, socketId, localeMessages, language) => {

    socket.on("joinAdminsRoom", (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            if (socket.socketTokenData.role != "admin" && socket.socketTokenData.role != "superAdmin")
                return sendAck({ success: false, code: 500, error: localeMessages.unauthorized })
            const adminsRoomId = ADMIN_ROOM_ID
            
            socket.join(adminsRoomId.toString())
            console.log(`Admin ${socket.socketTokenData._id} joined room ${adminsRoomId}`);
            const roomSockets = io.sockets.adapter.rooms.get(adminsRoomId.toString());
            console.log(`Current members in admin room: ${roomSockets ? roomSockets.size : 0}`);
            return sendAck({ success: true, code: 200 })
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendNotificationToGroup", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            if (socket.socketTokenData.role != "admin" && socket.socketTokenData.role != "superAdmin")
                return sendAck({ success: false, code: 500, error: localeMessages.unauthorized })
            console.log("Sending notification");
            let validationResult = socketValidator(createNotificationValidation, dataObject, language)
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
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendNotificationToAll", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            if (socket.socketTokenData.role != "admin" && socket.socketTokenData.role != "superAdmin")
                return sendAck({ success: false, code: 500, error: localeMessages.unauthorized })
            console.log("Sending notification");
            let validationResult = socketValidator(createNotificationValidation, dataObject, language)
            if (!validationResult.success) return sendAck(validationResult)

            let resultObject = await notificationRepo.create(dataObject)

            if (dataObject.toAll) io.emit("newNotification", { success: true, code: 201, result: resultObject.result })

            if (dataObject.toAllCustomers) {
                const customersRoomId = CUSTOMER_ROOM_ID
                io.to(customersRoomId.toString()).emit("newNotification", {
                    success: true,
                    code: 201,
                    result: resultObject.result
                })
            }

            if (dataObject.toAllSellers) {
                const sellersRoomId = SELLER_ROOM_ID
                io.to(sellersRoomId.toString()).emit("newNotification", {
                    success: true,
                    code: 201,
                    result: resultObject.result
                })
            }

            return sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })

}