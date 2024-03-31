const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const requestRepo = require("../modules/Request/request.repo")
const orderRepo = require("../modules/Order/order.repo")
const customerRepo = require("../modules/Customer/customer.repo")


exports.customerSocketHandler = (socket, io, socketId, localeMessages, language) => {
    socket.on("sendCreationNotification", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            let customerId = socket.handshake.headers['_id']
            const customerObject = await customerRepo.find({ _id: customerId })
            if (!customerObject.success) return sendAck(customerObject)

            let bodyText = { en: "", ar: "" }, deviceTokens = [], receivers = [], receiversIds = []
            let orderType = dataObject.order ? { en: "Order", ar: "طلب" } : { en: "Service Request", ar: "طلب خدمة" }
            let notificationType = dataObject.order ? "order" : "serviceRequest"
            let sender = {
                _id: customerObject.result._id.toString(),
                name: customerObject.result.name
            }

            if (dataObject.order) {
                const existingObject = await orderRepo.get({ _id: dataObject.order })
                if (!existingObject.success) return sendAck(existingObject)
                receivers = existingObject.result.sellers
                bodyText.en = `${sender.name} created a new order`
                bodyText.ar = `انشأ طلب جديد ${sender.name}`
            }


            if (dataObject.request) {
                const existingObject = await requestRepo.get({ _id: dataObject.request })
                if (!existingObject.success) return sendAck(existingObject)
                receivers = [existingObject.result.seller]
                bodyText.en = `${sender.name} requested your service ${existingObject.result.service.nameEn} from the following shop: ${existingObject.result.shop.nameEn}`
                bodyText.ar = `${sender.name} طلب خدمة ${existingObject.result.service.nameAr} من المتجر التالي: ${existingObject.result.shop.nameAr} `

            }

            receivers.forEach((receiver) => {
                deviceTokens.push(receiver.fcmToken)
                receiversIds.push(receiver._id.toString())
            })
            
            let notificationObject = {
                customer: sender._id,
                titleEn: `New ${orderType.en} from ${sender.name}`,
                titleAr: `${sender.name} ${orderType.ar} جديدة من`,
                bodyEn: bodyText.en,
                bodyAr: bodyText.ar,
                redirectId: dataObject?.order ? dataObject.order : dataObject.request,
                redirectType: notificationType,
                type: notificationType,
                receivers: receiversIds,
                deviceTokens: deviceTokens
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
            resultObject.result.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            })

            notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })
}