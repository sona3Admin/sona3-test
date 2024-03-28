const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const requestRepo = require("../modules/Request/request.repo")
const orderRepo = require("../modules/Order/order.repo")
const customerRepo = require("../modules/Customer/customer.repo")


exports.customerSocketHandler = (socket, io, socketId, localeMessages) => {
    socket.on("sendCreationNotification", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            let customerId = socket.handshake.headers['_id']
            let lang = socket.handshake.headers['accept-language'] || "en";
            const customerObject = await customerRepo.find({ _id: customerId })
            if (!customerObject.success) return sendAck(customerObject)

            let bodyText, deviceTokens = []
            let orderType = dataObject.order ? "Order" : "Service Request"
            let notificationType = dataObject.order ? "order" : "serviceRequest"
            let receivers = []
            let sender = {
                _id: customerObject.result._id.toString(),
                name: customerObject.result.name
            }


            if (dataObject.order) {
                const existingObject = await orderRepo.get({ _id: dataObject.order })
                if (!existingObject.success) return sendAck(existingObject)
                receivers = existingObject.result.sellers
                bodyText = `${sender.name} created a new order`
            }


            if (dataObject.request) {
                const existingObject = await requestRepo.get({ _id: dataObject.request })
                if (!existingObject.success) return sendAck(existingObject)

                receivers = [existingObject.result.seller]
                bodyText = `${sender.name} requested your service 
                ${existingObject.result.service.nameEn} from the following shop: 
                ${existingObject.result.shop.nameEn}`
            }

            receivers.forEach((receiver) => {
                deviceTokens.push(receiver.fcmToken)
                receiver = receiver._id.toString();
            })

            let notificationObject = {
                customer: sender._id,
                title: `New ${orderType} from ${sender.name}`,
                body: bodyText,
                type: notificationType,
                redirectId: dataObject?.order ? dataObject.order : dataObject.request,
                redirectType: notificationType,
                receivers: receivers,
                deviceTokens: deviceTokens
            }

            let resultObject = await notificationRepo.create(notificationObject)
            resultObject.result.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            })
            
            notificationHelper.sendPushNotification(resultObject.result.title, resultObject.result.body, resultObject.result.deviceTokens)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })
}