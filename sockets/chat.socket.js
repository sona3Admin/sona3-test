const roomRepo = require("../modules/Room/room.repo")
const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { sendMessageValidation } = require("../validations/room.validation")
const { socketValidator } = require("../helpers/socketValidation.helper")
const ADMIN_ROOM_ID = "Sona3AdminsRoom"

const { logInTestEnv } = require("../helpers/logger.helper")


exports.chatSocketHandler = (socket, io, socketId, localeMessages, language) => {


    socket.on("joinRoom", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            let isAuthorizedResult = await isAuthorized(socket, dataObject, localeMessages)
            if (!isAuthorizedResult.success) return sendAck(isAuthorizedResult)
            let roomObject = await roomRepo.find(dataObject)

            if (dataObject.customer) dataObject.withCustomer = true
            if (dataObject.seller) dataObject.withSeller = true
            if (!roomObject.success) roomObject = await roomRepo.create({ ...dataObject, lastMessage: {} })
            socket.join(roomObject.result._id.toString());
            logInTestEnv(socketId, " joined room: ", roomObject.result._id.toString());
            return sendAck(roomObject)

        } catch (err) {
            logInTestEnv(`err.message`, err.message);
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendMessage", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            let validator = socketValidator(sendMessageValidation, dataObject, language)
            if (!validator.success) return sendAck(validator)
            const existingObject = await roomRepo.get({ _id: dataObject.roomId })

            let isAuthorizedResult = await isAuthorizedToSendMessage(existingObject.result, socket, dataObject, localeMessages)
            if (!isAuthorizedResult.success) return sendAck(isAuthorizedResult)

            if (!existingObject.success || existingObject.result.isBlocked) return sendAck({
                code: 409,
                success: false,
                error: localeMessages.roomBlocked
            })

            let resultObject = await roomRepo.updateDirectly(dataObject.roomId, {
                $push: { messages: { $each: [dataObject.message], $position: 0 } },
                $inc: { unreadCount: 1 },
                lastMessage: dataObject.message,
                lastDate: dataObject.message.timestamp
            })
            socket.join(dataObject.roomId);
            logInTestEnv(socketId, " joined room: ", dataObject.roomId);
            io.to(dataObject.roomId).emit("newMessage", { success: true, code: 201, result: dataObject.message, roomId: dataObject.roomId })
            sendMessageNotification(io, existingObject.result, dataObject.message)

            return sendAck(resultObject)

        } catch (err) {
            logInTestEnv(`err.message`, err.message);
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }

    })


    socket.on('markAsRead', async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            notificationRepo.removeBy({ receivers: socket.socketTokenData._id, redirectId: dataObject.roomId })
            roomRepo.update(dataObject.roomId, { unreadCount: 0 })
            sendAck({ success: true, code: 200 })

        } catch (err) {
            logInTestEnv("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    });

}


async function sendMessageNotification(io, roomObject, messageObject) {
    try {
        logInTestEnv("Sending notification");
        let sender = {}, receiver = {}, notificationObject = {}, textFile = {}, receiverRole

        let adminsRoomId = { _id: ADMIN_ROOM_ID }

        if (messageObject.admin) {
            sender["name"] = "Sona3"
            sender["_id"] = ADMIN_ROOM_ID

            notificationObject.admin = messageObject.admin
            receiver = roomObject?.seller ? roomObject.seller : roomObject?.customer
            receiverRole = roomObject?.seller ? "seller" : "customer"
        }

        if (messageObject.seller) {
            sender["_id"] = messageObject.seller
            sender["name"] = roomObject.seller.userName
            sender["image"] = roomObject.seller.image

            notificationObject.seller = messageObject.seller
            receiver = roomObject?.customer ? roomObject.customer : []
            receiverRole = roomObject?.customer ? "customer" : "admin"
        }

        if (messageObject.customer) {
            sender["_id"] = roomObject.customer
            sender["image"] = roomObject.customer.image
            sender["name"] = roomObject.customer.name
            notificationObject.customer = messageObject.customer
            receiver = roomObject?.seller ? roomObject.seller : []
            receiverRole = roomObject?.seller ? "seller" : "admin"
        }

        if (receiverRole == "admin" || receiverRole == "superAdmin") {
            notificationObject.toAdmin = true
            receiver["_id"] = adminsRoomId
        }
        if (messageObject.file) textFile = { en: `${sender.name} sent a file`, ar: `أرسل ${sender.name} ملفًا` }

        notificationObject = {
            ...notificationObject,
            titleEn: `New Notification from ${sender.name}`,
            titleAr: `${sender.name} رسالة جديدة من`,
            bodyEn: messageObject.text ? messageObject.text : textFile.en,
            bodyAr: messageObject.text ? messageObject.text : textFile.ar,
            timestamp: messageObject.timestamp,
            redirectId: roomObject._id.toString(),
            redirectType: "room",
            type: "message",
            toAdmin: receiverRole != "admin" ? false : true,
            receivers: receiver?.length != 0 ? [receiver._id.toString()] : [],
            deviceTokens: receiver?.fcmToken ? [receiver.fcmToken] : []
        }
        let resultObject = await notificationRepo.create(notificationObject)
        let title = {
            en: resultObject.result.titleEn,
            ar: resultObject.result.titleAr
        }
        let body = {
            en: resultObject.result.bodyEn,
            ar: resultObject.result.bodyAr
        }
        receiver = receiverRole != "admin" ? receiver : adminsRoomId
        logInTestEnv("receiver", receiver._id.toString())
        resultObject.result["sender"] = sender
        io.to(receiver._id.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
        if (resultObject.result.deviceTokens.length > 0) notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)

    } catch (err) {
        logInTestEnv("err.message", err.message);
    }
}


async function isAuthorized(socket, dataObject, localeMessages) {
    try {
        if (socket.socketTokenData.role == "admin" || socket.socketTokenData.role == "superAdmin") return { success: true, code: 200 }
        if (socket.socketTokenData.role == "seller") {
            if (!dataObject.seller || dataObject.seller != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            return { success: true, code: 200 }
        }
        if (socket.socketTokenData.role == "customer") {
            if (!dataObject.customer || dataObject.customer != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            return { success: true, code: 200 }
        }
    } catch (err) {
        logInTestEnv("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.unauthorized }
    }
}


async function isAuthorizedToSendMessage(roomObject, socket, dataObject, localeMessages) {
    try {

        if (socket.socketTokenData.role == "admin" || socket.socketTokenData.role == "superAdmin") {
            if (!roomObject.withAdmin || dataObject.message.admin != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            return { success: true, code: 200 }
        }
        if (socket.socketTokenData.role == "seller") {
            if (!roomObject.seller || roomObject.seller._id.toString() != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            if (!dataObject.message.seller || dataObject.message.seller != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            return { success: true, code: 200 }
        }
        if (socket.socketTokenData.role == "customer") {
            if (!roomObject.customer || roomObject.customer._id.toString() != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            if (!dataObject.message.customer || dataObject.message.customer != socket.socketTokenData._id) return { success: false, code: 500, error: localeMessages.unauthorized }
            return { success: true, code: 200 }
        }
    } catch (err) {
        logInTestEnv("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.unauthorized }
    }
}