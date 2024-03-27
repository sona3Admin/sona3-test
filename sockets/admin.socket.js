const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { getSettings } = require("../helpers/settings.helper")
const serviceRepo = require("../modules/Service/service.repo")
const productRepo = require("../modules/Product/product.repo")
const shopRepo = require("../modules/Shop/shop.repo")
const sellerRepo = require("../modules/Seller/seller.repo")



exports.adminSocketHandler = (socket, io, socketId, localeMessages) => {

    socket.on("joinAdminsRoom", (dataObject, sendAck) => {
        try {
            const adminId = dataObject._id
            const adminsRoomId = getSettings("adminsRoomId")
            socket.join(adminsRoomId.toString())
            return sendAck({ success: true, code: 200 })
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

        }
    })

    socket.on("sendVerificationResult", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            let sender = {
                _id: socket.handshake.headers['_id'],
                name: "Sona3"
            }
            let bodyText = "Is Verified"
            let receiver = {}


            if (dataObject.shop) {
                const existingObject = await shopRepo.get({ _id: dataObject.shop })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result.seller
                bodyText = "your shop " + bodyText
            }

            if (dataObject.seller) {
                const existingObject = await sellerRepo.get({ _id: dataObject.seller })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result
                bodyText = "your account " + bodyText
            }

            if (dataObject.product) {
                const existingObject = await productRepo.get({ _id: dataObject.product })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result.seller
                bodyText = "your product " + bodyText
            }

            if (dataObject.service) {
                const existingObject = await serviceRepo.get({ _id: dataObject.service })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result.seller
                bodyText = "your service " + bodyText
            }

            let notificationObject = {
                admin: sender._id,
                title: `New Message from ${sender.name}`,
                body: bodyText,
                type: "Verified",
                receivers: receiver ? [receiver._id.toString()] : [],
                deviceTokens: receiver ? [receiver.fcmToken] : []
            }

            let resultObject = await notificationRepo.create(notificationObject)
            io.to(receiver._id.toString()).emit("newMessageNotification", { success: true, code: 201, result: resultObject.result })
            notificationHelper.sendPushNotification(resultObject.result.title, resultObject.result.body, resultObject.result.deviceTokens)
            return sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

        }
    })

}