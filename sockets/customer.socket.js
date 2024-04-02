const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const requestRepo = require("../modules/Request/request.repo")
const orderRepo = require("../modules/Order/order.repo")
const serviceRepo = require("../modules/Service/service.repo")
const productRepo = require("../modules/Product/product.repo")
const shopRepo = require("../modules/Shop/shop.repo")
const sellerRepo = require("../modules/Seller/seller.repo")
const { getSettings } = require("../helpers/settings.helper")


exports.customerSocketHandler = (socket, io, socketId, localeMessages, language) => {
    socket.on("sendCreationNotification", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            if (!sendAck) return socket.disconnect(true)
            let notificationResult = {}
            let sender = {
                _id: socket.socketTokenData._id,
                name: socket.socketTokenData.role == "seller" ? socket.socketTokenData.userName : socket.socketTokenData.name,
                role: socket.socketTokenData.role
            }

            if (sender.role == "customer") notificationResult = await customer(sender, dataObject, localeMessages)
            else if (sender.role == "seller") notificationResult = await seller(sender, dataObject, localeMessages)
            else return sendAck({ success: false, error: localeMessages.unauthorized, code: 403 })

            if (!notificationResult.success) return sendAck(notificationResult)


            let resultObject = await notificationRepo.create(notificationResult.notificationObject)
            let title = {
                en: resultObject.result.titleEn,
                ar: resultObject.result.titleAr
            }
            let body = {
                en: resultObject.result.bodyEn,
                ar: resultObject.result.bodyAr
            }
            notificationResult.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            })
            if (resultObject.result.deviceTokens.length != 0) notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })
}

async function customer(sender, dataObject, localeMessages) {
    try {
        let bodyText = {}, orderType = {}, notificationType = {}, deviceTokens = [], receivers = [], receiversIds = []


        if (dataObject.order) {
            orderType = { en: "Order", ar: "طلب" }
            notificationType = "order"
            const existingObject = await orderRepo.get({ _id: dataObject.order })
            if (!existingObject.success) return existingObject
            receivers = existingObject.result.sellers
            bodyText.en = `${sender.name} created a new order`
            bodyText.ar = `انشأ طلب جديد ${sender.name}`
        }


        if (dataObject.request) {
            orderType = { en: "Service Request", ar: "طلب خدمة" }
            notificationType = "order"
            const existingObject = await requestRepo.get({ _id: dataObject.request })
            if (!existingObject.success) return existingObject
            receivers = [existingObject.result.seller]
            bodyText.en = `${sender.name} requested your service ${existingObject.result.service.nameEn} from the following shop: ${existingObject.result.shop.nameEn}`
            bodyText.ar = `${sender.name} طلب خدمة ${existingObject.result.service.nameAr} من المتجر التالي: ${existingObject.result.shop.nameAr} `

        }

        receivers.forEach((receiver) => {
            if (receiver.fcmToken) deviceTokens.push(receiver.fcmToken)
            receiversIds.push(receiver._id.toString())
        })

        let notificationObject = {
            customer: sender._id,
            titleEn: `New ${orderType.en} from ${sender.name}`,
            titleAr: `${sender.name} ${orderType.ar} جديد من`,
            bodyEn: bodyText.en,
            bodyAr: bodyText.ar,
            redirectId: dataObject?.order ? dataObject.order : dataObject.request,
            redirectType: notificationType,
            type: notificationType,
            receivers: receiversIds,
            deviceTokens: deviceTokens
        }
        let resultObject = {
            success: true,
            notificationObject: notificationObject,
            receivers: receiversIds
        }
        return resultObject

    } catch (err) {
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.internalServerError }
    }
}


async function seller(sender, dataObject, localeMessages) {
    try {
        let bodyText = {}, creationType = {}, redirectType = {}, redirectId, receiver

        if (dataObject.seller) {
            creationType = { en: "Seller", ar: "بائع" }
            const existingObject = await sellerRepo.find({ _id: dataObject.seller })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result
            redirectId = dataObject.seller
            redirectType = "seller"
            bodyText.en = `${sender.name} seller has been created`
            bodyText.ar = `تم إنشاء ${sender.name} البائع`
        }

        if (dataObject.shop) {
            creationType = { en: "Shop", ar: "متجر" }
            const existingObject = await shopRepo.find({ _id: dataObject.shop })
            if (!existingObject.success) return existingObject
            redirectId = dataObject.shop
            redirectType = "shop"
            bodyText.en = `${existingObject.result.nameEn} shop has been created by ${sender.name}`
            bodyText.ar = `تم إنشاء متجر ${existingObject.result.nameAr} بواسطة ${sender.name}`
        }

        if (dataObject.product) {
            creationType = { en: "Product", ar: "منتج" }
            const existingObject = await productRepo.get({ _id: dataObject.product })
            if (!existingObject.success) return existingObject
            redirectId = dataObject.product
            redirectType = "product"
            bodyText.en = `${existingObject.result.nameEn} product has been created by ${sender.name} seller in ${existingObject.result.shop.nameEn} shop`
            bodyText.ar = `تم إنشاء المنتج ${existingObject.result.nameAr} بواسطة البائع: ${sender.name} في متجر: ${existingObject.result.shop.nameAr}`
        }

        if (dataObject.service) {
            creationType = { en: "Service", ar: "خدمة" }
            const existingObject = await serviceRepo.get({ _id: dataObject.service })
            if (!existingObject.success) return existingObject
            redirectId = dataObject.service
            redirectType = "service"
            bodyText.en = `${existingObject.result.nameEn} service has been created by ${sender.name} seller in ${existingObject.result.shop.nameEn} shop`
            bodyText.ar = `تم إنشاء الخدمة ${existingObject.result.nameAr} بواسطة البائع: ${sender.name} في متجر: ${existingObject.result.shop.nameAr}`
        }

        let notificationObject = {
            seller: sender._id,
            titleEn: creationType.en != "Seller" ? `New ${creationType.en} from ${sender.name}` : `New ${creationType.en}`,
            titleAr: creationType.ar != "بائع" ?`${sender.name} ${creationType.ar} جديد من`:`${creationType.ar} جديد`,
            bodyEn: bodyText.en,
            bodyAr: bodyText.ar,
            redirectId: redirectId.toString(),
            redirectType: redirectType,
            type: "creation",
            toAdmin: true,
            receivers: [],
            deviceTokens: []
        }
        let resultObject = {
            success: true,
            notificationObject: notificationObject,
            receivers: [getSettings("adminsRoomId").toString()]
        }
        return resultObject

    } catch (err) {
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.internalServerError }
    }
}