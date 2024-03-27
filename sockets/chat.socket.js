const roomRepo = require("../modules/Room/room.repo")
const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")


exports.chatSocketHandler = (socket, io, socketId, localeMessages) => {


    socket.on("joinRoom", async (dataObject, sendAck) => {
        try {
            let roomObject = await roomRepo.find(dataObject)
            if (!roomObject.success) roomObject = await roomRepo.create({ ...dataObject, lastMessage: {} })
            socket.join(roomObject.result._id.toString());
            console.log(socketId, " joined room: ", roomObject.result._id.toString());
            return sendAck(roomObject)

        } catch (err) {
            console.log(`err.message`, err.message);
            return io.to(socketId).emit("error", {
                success: false,
                code: 500,
                error: localeMessages.internalServerError
            })
        }
    })


    socket.on("sendMessage", async (dataObject, sendAck) => {
        try {
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
            return io.to(socketId).emit("error", {
                success: false,
                code: 500,
                error: localeMessages.internalServerError
            })

        }

    })

}


function sendMessageNotification(io, roomObject, messageObject) {
    try {
        console.log("Sending notification");
        let sender = {}, receiver = {}

        if (messageObject.admin) {
            sender["name"] = "Sona3"
            receiver = roomObject?.seller ? roomObject.seller : roomObject?.customer
        }

        if (messageObject.seller) {
            sender = messageObject.seller
            sender.name = roomObject.seller.userName
            receiver = roomObject?.customer
        }

        if (messageObject.customer) {
            sender = roomObject.customer
            receiver = roomObject?.seller
        }
        
        let notificationObject = {
            title: `New Message from ${sender.name}`,
            body: messageObject.text,
            redirectId: roomObject._id.toString(),
            redirectType: "room",
            type: "message",
            receivers: receiver ? [receiver._id.toString()] : []
        }
        notificationRepo.create(notificationObject)
        console.log("receiver", receiver._id.toString())
        io.to(receiver._id.toString()).emit("newMessageNotification", { success: true, code: 201, result: notificationObject })
        notificationHelper.sendPushNotification(notificationObject.title, notificationObject.body, [receiver.fcmToken])

    } catch (err) {
        console.log("err.message", err.message);
    }
}