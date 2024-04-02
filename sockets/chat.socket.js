const roomRepo = require("../modules/Room/room.repo")
const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { getSettings } = require("../helpers/settings.helper")
const { sendMessageValidation } = require("../validations/room.validation")
const { socketValidator } = require("../helpers/socketValidation.helper")


exports.chatSocketHandler = (socket, io, socketId, localeMessages, language) => {


    socket.on("joinRoom", async (dataObject, sendAck) => {
        try {
            if (!sendAck) return
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
            if (!sendAck) return
            let validator = await socketValidator(sendMessageValidation, dataObject, language)
            if (!validator.success) return sendAck(validator)

            const existingObject = await roomRepo.get({ _id: dataObject.roomId })
            if (!existingObject.success || existingObject.result.isBlocked) return sendAck({
                code: 409,
                success: false,
                error: localeMessages.roomBlocked
            })

            let resultObject = await roomRepo.updateDirectly(dataObject.roomId, {
                $push: { messages: dataObject.message },
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
        let sender = {}, receiver = {}, notificationObject = {}

        if (messageObject.admin) {
            sender["name"] = "Sona3"
            sender["_id"] = getSettings("adminsRoomId")
            notificationObject.admin = messageObject.admin
            receiver = roomObject?.seller ? roomObject.seller : roomObject?.customer
        }

        if (messageObject.seller) {
            sender = messageObject.seller
            sender.name = roomObject.seller.userName
            notificationObject.seller = messageObject.seller
            receiver = roomObject?.customer ? roomObject.customer : { _id: getSettings("adminsRoomId") }
        }

        if (messageObject.customer) {
            sender = roomObject.customer
            notificationObject.customer = messageObject.customer
            receiver = roomObject?.seller ? roomObject.seller : { _id: getSettings("adminsRoomId") }
        }
        notificationObject = {
            ...notificationObject,
            titleEn: `New Notification from ${sender.name}`,
            titleAr: `${sender.name} رسالة جديدة من`,
            bodyEn: messageObject.text,
            bodyAr: messageObject.text,
            redirectId: roomObject._id.toString(),
            redirectType: "room",
            type: "message",
            receivers: receiver ? [receiver._id.toString()] : [],
            deviceTokens: receiver ? [receiver.fcmToken] : []
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
        console.log("receiver", receiver._id.toString())
        io.to(receiver._id.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
        notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)

    } catch (err) {
        console.log("err.message", err.message);
        return
    }
}