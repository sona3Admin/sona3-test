const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const serviceRepo = require("../modules/Service/service.repo")
const orderRepo = require("../modules/Order/order.repo")
const customerRepo = require("../modules/Customer/customer.repo")


exports.customerSocketHandler = (socket, io, socketId, localeMessages) => {
    try {
        socket.on("sendCreationNotefication", async (dataObject, sendAck) => {
            console.log("Sending notification");
            let customerId = socket.handshake.headers['_id']
            const customerObject = await customerRepo.get({ _id: customerId })
            if (!customerObject.success) return sendAck(customerObject)

            let sender = {
                _id: customerObject.result._id.toString(),
                name: customerObject.result.name
            }
            let bodyText, type, deviceTokens = []
            let receivers = []


            if (dataObject.order) {
                const existingObject = await orderRepo.get({ _id: dataObject.order })
                if (!existingObject.success) return sendAck(existingObject)
                receivers = existingObject.result.sellers
                bodyText = `${sender.name} created order`
                type = "order"
            }

            if (dataObject.service) {
                const existingObject = await serviceRepo.get({ _id: dataObject.service })
                if (!existingObject.success) return sendAck(existingObject)
                receivers = [existingObject.result.seller]
                bodyText = `${sender.name} requested your service`
                type = "serviceRequest"
            }

            receivers.forEach((receiver) => {
                deviceTokens.push(receiver.fcmToken)
            })

            let notificationObject = {
                customer: sender._id,
                title: `New Message from ${sender.name}`,
                body: bodyText,
                type: type,
                redirectId: dataObject?.service ? dataObject.service : dataObject.order,
                redirectType: type,
                receivers: receivers,
                deviceTokens: deviceTokens
            }

            let resultObject = await notificationRepo.create(notificationObject)
            resultObject.result.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newMessageNotification", { success: true, code: 201, result: resultObject.result })
            })
            notificationHelper.sendPushNotification(resultObject.result.title, resultObject.result.body, resultObject.result.deviceTokens)
            return sendAck(resultObject)
        })
    } catch (err) {
        console.log("err.message", err.message)
        return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

    }
}