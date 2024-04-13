const roomRepo = require("../modules/Room/room.repo")
const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { getSettings } = require("../helpers/settings.helper")
const { sendMessageValidation } = require("../validations/room.validation")
const { socketValidator } = require("../helpers/socketValidation.helper")


exports.chatSocketHandler = (socket, io, socketId, localeMessages, language) => {


    socket.on("joinRoom", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            let isAuthorizedResult = await isAuthorizedRoom(socket, dataObject, localeMessages)
            if (!isAuthorizedResult.success) return sendAck(isAuthorizedResult)
            let roomObject = await roomRepo.find(dataObject)
            if (!roomObject.success) roomObject = await roomRepo.create({ ...dataObject, lastMessage: {} })
            socket.join(roomObject.result._id.toString());
            console.log(socketId, " joined room: ", roomObject.result._id.toString());
            return sendAck(roomObject)

        } catch (err) {
            console.log(`err.message`, err.message);
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendMessage", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            let validator = await socketValidator(sendMessageValidation, dataObject, language)
            if (!validator.success) return sendAck(validator)
            const existingObject = await roomRepo.get({ _id: dataObject.roomId })

            let isAuthorizedResult = await isAuthorizedMessage(existingObject.result, socket, dataObject, localeMessages)
            if (!isAuthorizedResult.success) return sendAck(isAuthorizedResult)
            
            if (!existingObject.success || existingObject.result.isBlocked) return sendAck({
                code: 409,
                success: false,
                error: localeMessages.roomBlocked
            })

            let resultObject = await roomRepo.updateDirectly(dataObject.roomId, {
                $push: { messages: { $each: [dataObject.message], $position: 0 } },
                lastMessage: dataObject.message,
                lastDate: dataObject.message.timestamp
            })
            socket.join(dataObject.roomId);
            console.log(socketId, " joined room: ", dataObject.roomId);
            io.to(dataObject.roomId).emit("newMessage", { success: true, code: 201, result: dataObject.message })
            sendMessageNotification(io, existingObject.result, dataObject.message)

            return sendAck(resultObject)

        } catch (err) {
            console.log(`err.message`, err.message);
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }

    })

}


async function sendMessageNotification(io, roomObject, messageObject) {
    try {
        console.log("Sending notification");
        let sender = {}, receiver = {}, notificationObject = {}, textFile = {}, receiverRole

        let adminsRoomId = { _id: getSettings("adminsRoomId") }

        if (messageObject.admin) {
            sender["name"] = "Sona3"
            sender["_id"] = getSettings("adminsRoomId")
            console.log();
            notificationObject.admin = messageObject.admin
            receiver = roomObject?.seller ? roomObject.seller : roomObject?.customer
            receiverRole = roomObject?.seller ? "seller" : "customer"
        }

        if (messageObject.seller) {
            sender = messageObject.seller
            sender.name = roomObject.seller.userName
            notificationObject.seller = messageObject.seller
            receiver = roomObject?.customer ? roomObject.customer : []
            receiverRole = roomObject?.customer ? "customer" : "admin"
        }

        if (messageObject.customer) {
            sender = roomObject.customer
            notificationObject.customer = messageObject.customer
            receiver = roomObject?.seller ? roomObject.seller : []
            receiverRole = roomObject?.seller ? "seller" : "admin"
        }

        if (messageObject.file) textFile = { en: `${sender.name} sent a file`, ar: `أرسل ${sender.name} ملفًا` }

        notificationObject = {
            ...notificationObject,
            titleEn: `New Notification from ${sender.name}`,
            titleAr: `${sender.name} رسالة جديدة من`,
            bodyEn: messageObject.text ? messageObject.text : textFile.en,
            bodyAr: messageObject.text ? messageObject.text : textFile.ar,
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
        console.log("receiver", receiver._id.toString())
        io.to(receiver._id.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
        if (resultObject.result.deviceTokens.length != 0) notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)

    } catch (err) {
        console.log("err.message", err.message);
        return
    }
}


async function isAuthorizedRoom(socket, dataObject, localeMessages) {
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
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.unauthorized }
    }
}


async function isAuthorizedMessage(roomObject, socket, dataObject, localeMessages) {
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
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.unauthorized }
    }
}