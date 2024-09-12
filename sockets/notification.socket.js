const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const requestRepo = require("../modules/Request/request.repo")
const orderRepo = require("../modules/Order/order.repo")
const serviceRepo = require("../modules/Service/service.repo")
const productRepo = require("../modules/Product/product.repo")
const variationRepo = require("../modules/Variation/variation.repo")
const shopRepo = require("../modules/Shop/shop.repo")
const sellerRepo = require("../modules/Seller/seller.repo")

const ADMIN_ROOM_ID = "Sona3AdminsRoom"
const CUSTOMER_ROOM_ID = "Sona3CustomersRoom"
const SELLER_ROOM_ID = "Sona3SellersRoom"

exports.notificationSocketHandler = (socket, io, socketId, localeMessages, language) => {

    socket.on("joinCustomersRoom", (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            if (socket.socketTokenData.role != "customer")
                return sendAck({ success: false, code: 500, error: localeMessages.unauthorized })
            const customersRoomId = CUSTOMER_ROOM_ID
            socket.join(customersRoomId.toString())
            return sendAck({ success: true, code: 200 })
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("joinSellersRoom", (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            if (socket.socketTokenData.role != "seller")
                return sendAck({ success: false, code: 500, error: localeMessages.unauthorized })
            const sellersRoomId = SELLER_ROOM_ID
            socket.join(sellersRoomId.toString())
            return sendAck({ success: true, code: 200 })
        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendCreationNotification", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            let notificationResult = {}

            if (!sendAck) return socket.disconnect(true)
            if (!socket.socketTokenData.role) return sendAck({ success: false, error: localeMessages.unauthorized, code: 403 })

            let sender = {
                _id: socket.socketTokenData._id,
                name: socket.socketTokenData.role == "seller" ? socket.socketTokenData.userName : socket.socketTokenData.name,
                role: socket.socketTokenData.role
            }

            if (sender.role == "customer") notificationResult = await handleCreationByCustomer(sender, dataObject, localeMessages)
            if (sender.role == "seller") notificationResult = await handleCreationBySeller(sender, dataObject, localeMessages)
            if (!notificationResult.success) return sendAck(notificationResult)

            if (!notificationResult.notificationObject.timestamp) notificationResult.notificationObject.timestamp = dataObject.timestamp
            let resultObject = await notificationRepo.create(notificationResult.notificationObject)

            let title = { en: resultObject.result.titleEn, ar: resultObject.result.titleAr }
            let body = { en: resultObject.result.bodyEn, ar: resultObject.result.bodyAr }

            notificationResult.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", {
                    success: true, code: 201, result: resultObject.result
                })
            })

            if (resultObject.result.deviceTokens.length > 0) notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendStatusUpdates", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");

            let notificationResult;
            let actionEnumValues = ["activate", "deactivate", "changeData", "updateStatus"]

            if (!sendAck) return socket.disconnect(true)
            if (!socket.socketTokenData.role) return sendAck({ success: false, error: localeMessages.unauthorized, code: 403 })
            if (!dataObject.action || !actionEnumValues.includes(dataObject.action)) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
            if (dataObject.action == "updateStatus" && !dataObject.order && !dataObject.request) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
            if (dataObject.action != "updateStatus" && (dataObject.order || dataObject.request)) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

            let bodyMessages = {
                activate: { en: " is verified", ar: " تم التحقق منه", },
                deactivate: { en: " is not verified", ar: " لم يتم التحقق منه" },
                changeData: { en: " data has changed", ar: " لقد تغيرت بياناته" },
                updateStatus: { en: " status has changed", ar: " لقد تغيرت حالته" }
            }

            let sender = { _id: socket.socketTokenData._id, role: socket.socketTokenData.role }

            if (sender.role == "admin" || sender.role == "superAdmin") {
                sender.name = "Sona3"
                notificationResult = await handleUpdateByAdmin(sender, dataObject, localeMessages, bodyMessages[`${dataObject.action}`])
            }

            if (sender.role == "seller") {
                sender.name = socket.socketTokenData.userName
                if (dataObject.order || dataObject.request) notificationResult = await updateTransactionStatus(sender, dataObject, localeMessages, bodyMessages[`${dataObject.action}`])
                else notificationResult = await handleUpdateBySeller(sender, dataObject, localeMessages, bodyMessages[`${dataObject.action}`])
            }

            if (sender.role == "customer" && (dataObject.order || dataObject.request)) {
                sender.name = socket.socketTokenData.name
                notificationResult = await updateTransactionStatus(sender, dataObject, localeMessages, bodyMessages[`${dataObject.action}`])
            }

            if (!notificationResult.success) return sendAck(notificationResult)
            if (!notificationResult.notificationObject.timestamp) notificationResult.notificationObject.timestamp = dataObject.timestamp

            let resultObject = await notificationRepo.create(notificationResult.notificationObject)

            let title = { en: resultObject.result.titleEn, ar: resultObject.result.titleAr }
            let body = { en: resultObject.result.bodyEn, ar: resultObject.result.bodyAr }

            notificationResult.receivers.forEach((receiver) => {
                io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            })

            if (resultObject.result.deviceTokens.length != 0) notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on('markAsSeen', async (dataObject, sendAck) => {
        try {
            if (!sendAck) return socket.disconnect(true)
            let resultObject = notificationRepo.update(dataObject.notification, {
                $addToSet: { seenBy: socket.socketTokenData._id }
            })
            sendAck({ success: true, code: 200 })

        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    });


    socket.on("sendServicePriceUpdate", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");

            if (!sendAck) return socket.disconnect(true)
            if (!dataObject.request) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

            let serviceRequest = await requestRepo.get({ _id: dataObject.request })
            if (!serviceRequest.success) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
            if (serviceRequest.result.seller._id.toString() != socket.socketTokenData._id) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

            let receiver = serviceRequest.result.customer._id.toString()
            let sender = { _id: socket.socketTokenData._id, role: socket.socketTokenData.role }

            let notificationObject = {
                seller: socket.socketTokenData._id,
                titleEn: "Update on your service request",
                titleAr: "هناك تحديث لسعر طلب الخدمة",
                bodyEn: `${serviceRequest.result.shop.nameEn} has updated the price for your request on service ${serviceRequest.result.service.nameEn}`,
                bodyAr: `قام ${serviceRequest.result.shop.nameAr} بتحديث سعر طلبك للخدمة ${serviceRequest.result.service.nameAr}`,
                redirectId: dataObject.request,
                redirectType: "serviceRequest",
                type: "servicePriceUpdate",
                receivers: [receiver],
                deviceTokens: [serviceRequest.result.customer.fcmToken],
                timestamp: dataObject.timestamp
            }

            let resultObject = await notificationRepo.create(notificationObject)

            let title = { en: resultObject.result.titleEn, ar: resultObject.result.titleAr }
            let body = { en: resultObject.result.bodyEn, ar: resultObject.result.bodyAr }

            io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })

            if (serviceRequest.result.customer.fcmToken) notificationHelper.sendPushNotification(title, body, serviceRequest.result.customer.fcmToken)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendOutOfStockAlert", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");

            if (!sendAck) return socket.disconnect(true)
            if (!dataObject.variation) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

            let variationObject = await variationRepo.get({ _id: dataObject.variation })
            if (!variationObject.success) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

            let receiver = variationObject.result.seller._id.toString()

            let notificationObject = {
                seller: receiver,
                titleEn: "A product is running out of stock",
                titleAr: "لديك منتج ينفد من المخزون",
                bodyEn: `${variationObject.result.descriptionEn} from the product  ${variationObject.result.product.nameEn} is running out of stock`,
                bodyAr: `التشكيلة ${variationObject.result.descriptionAr} من المنتج ${variationObject.result.product.nameAr} على وشك النفاذ من المخزن`,
                redirectId: dataObject.variation,
                redirectType: "variation",
                type: "admin",
                receivers: [receiver],
                deviceTokens: [variationObject.result.seller.fcmToken],
                timestamp: dataObject.timestamp
            }

            let resultObject = await notificationRepo.create(notificationObject)

            let title = { en: resultObject.result.titleEn, ar: resultObject.result.titleAr }
            let body = { en: resultObject.result.bodyEn, ar: resultObject.result.bodyAr }

            io.to(receiver.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })

            if (serviceRequest.result.customer.fcmToken) notificationHelper.sendPushNotification(title, body, serviceRequest.result.customer.fcmToken)
            return sendAck(resultObject)

        } catch (err) {
            console.log("err.message", err.message)
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })

}


async function handleCreationByCustomer(sender, dataObject, localeMessages) {
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
            notificationType = "serviceRequest"
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
        console.log("handleCreationByCustomer", dataObject.timestamp)

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
            deviceTokens: deviceTokens,
            timestamp: dataObject.timestamp
        }

        return {
            success: true,
            notificationObject: notificationObject,
            receivers: receiversIds,
            code: 200,
        }

    } catch (err) {
        console.log("err.message --", err.message);
        return { success: false, code: 500, error: localeMessages.internalServerError }
    }
}


async function handleCreationBySeller(sender, dataObject, localeMessages) {
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
            titleAr: creationType.ar != "بائع" ? `${sender.name} ${creationType.ar} جديد من` : `${creationType.ar} جديد`,
            bodyEn: bodyText.en,
            bodyAr: bodyText.ar,
            redirectId: redirectId.toString(),
            redirectType: redirectType,
            type: "creation",
            toAdmin: true,
            receivers: [],
            deviceTokens: [],
            timestamp: dataObject.timestamp
        }

        return {
            code: 200,
            success: true,
            notificationObject: notificationObject,
            receivers: [ADMIN_ROOM_ID]
        }

    } catch (err) {
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.internalServerError }
    }
}


async function handleUpdateByAdmin(sender, dataObject, localeMessages, bodyMessageAction) {
    try {
        let bodyText = {}, receiver = {}, redirectType, redirectId;

        if (dataObject.seller) {
            const existingObject = await sellerRepo.find({ _id: dataObject.seller })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result
            redirectId = dataObject.seller
            redirectType = "seller"
            bodyText.en = "Your account" + bodyMessageAction.en
            bodyText.ar = "الحساب الخاص بك" + bodyMessageAction.ar
        }

        if (dataObject.shop) {
            const existingObject = await shopRepo.get({ _id: dataObject.shop })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result.seller
            redirectId = dataObject.shop
            redirectType = "shop"
            bodyText.en = "Your shop " + `${existingObject.result.nameEn}` + bodyMessageAction.en
            bodyText.ar = "المتجر الخاصة بك " + `${existingObject.result.nameAr}` + bodyMessageAction.ar
        }

        if (dataObject.product) {
            const existingObject = await productRepo.get({ _id: dataObject.product })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result.seller
            redirectId = dataObject.product
            redirectType = "product"
            bodyText.en = "Your product " + `${existingObject.result.nameEn}` + bodyMessageAction.en
            bodyText.ar = "المنتج الخاصة بك " + `${existingObject.result.nameAr}` + bodyMessageAction.ar
        }

        if (dataObject.service) {
            const existingObject = await serviceRepo.get({ _id: dataObject.service })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result.seller
            redirectId = dataObject.service
            redirectType = "service"
            bodyText.en = "Your service " + `${existingObject.result.nameEn}` + bodyMessageAction.en
            bodyText.ar = "الخدمة الخاصة بك " + `${existingObject.result.nameAr}` + bodyMessageAction.ar
        }

        let notificationObject = {
            admin: sender._id,
            titleEn: `New Notification from ${sender.name}`,
            titleAr: `${sender.name} إشعار جديد من`,
            bodyEn: bodyText.en,
            bodyAr: bodyText.ar,
            redirectId: redirectId.toString(),
            redirectType: redirectType,
            type: dataObject.action,
            receivers: receiver ? [receiver._id.toString()] : [],
            deviceTokens: receiver?.fcmToken ? [receiver.fcmToken] : [],
            timestamp: dataObject.timestamp
        }

        return {
            code: 200,
            success: true,
            notificationObject: notificationObject,
            receivers: receiver ? [receiver._id.toString()] : [],
        }

    } catch (err) {
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.internalServerError }
    }
}


async function handleUpdateBySeller(sender, dataObject, localeMessages, bodyMessageAction) {
    try {
        let bodyText = {}, receiver = {}, redirectType, redirectId;

        if (dataObject.seller) {
            const existingObject = await sellerRepo.find({ _id: dataObject.seller })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result
            redirectId = dataObject.seller
            redirectType = "seller"
            bodyText.en = `${sender.name} seller` + bodyMessageAction.en
            bodyText.ar = `البائع ${sender.name} ` + bodyMessageAction.ar
        }

        if (dataObject.shop) {
            const existingObject = await shopRepo.get({ _id: dataObject.shop })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result.seller
            redirectId = dataObject.shop
            redirectType = "shop"
            bodyText.en = `${existingObject.result.nameEn} shop for seller ${sender.name} ` + bodyMessageAction.en
            bodyText.ar = `المتجر ${existingObject.result.nameAr} للبائع ${sender.name} ` + bodyMessageAction.ar
        }

        if (dataObject.product) {
            const existingObject = await productRepo.get({ _id: dataObject.product })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result.seller
            redirectId = dataObject.product
            redirectType = "product"
            bodyText.en = `${existingObject.result.nameEn} product for seller ${sender.name} ` + bodyMessageAction.en
            bodyText.ar = `المنتج ${existingObject.result.nameAr} للبائع ${sender.name} ` + bodyMessageAction.ar
        }

        if (dataObject.service) {
            const existingObject = await serviceRepo.get({ _id: dataObject.service })
            if (!existingObject.success) return existingObject
            receiver = existingObject.result.seller
            redirectId = dataObject.service
            redirectType = "service"
            bodyText.en = `${existingObject.result.nameEn} service for seller ${sender.name} ` + bodyMessageAction.en
            bodyText.ar = `الخدمة ${existingObject.result.nameAr} للبائع ${sender.name} ` + bodyMessageAction.ar
        }

        let notificationObject = {
            seller: sender._id,
            titleEn: `New Notification from ${sender.name}`,
            titleAr: `${sender.name} إشعار جديد من`,
            bodyEn: bodyText.en,
            bodyAr: bodyText.ar,
            redirectId: redirectId.toString(),
            redirectType: redirectType,
            type: dataObject.action,
            toAdmin: true,
            receivers: [],
            deviceTokens: [],
            timestamp: dataObject.timestamp
        }

        return {
            code: 200,
            success: true,
            notificationObject: notificationObject,
            receivers: [ADMIN_ROOM_ID]
        }

    } catch (err) {
        console.log("err.message", err.message);
        return { success: false, code: 500, error: localeMessages.internalServerError }
    }
}


async function updateTransactionStatus(sender, dataObject, localeMessages, bodyMessageAction) {
    try {
        let bodyText = {}, orderType = {}, receivers = [], redirectType, receiversIds = [], deviceTokens = []

        let notificationObject = sender.role != "seller" ? { customer: sender._id } : { seller: sender._id }

        if (dataObject.order) {
            orderType = { en: "Order", ar: "طلب" }
            redirectType = "order"
            const existingObject = await orderRepo.get({ _id: dataObject.order })
            if (!existingObject.success) return existingObject
            receivers = sender.role != "seller" ? existingObject.result.sellers : [existingObject.result.customer]
            bodyText.en = `${sender.name} updated the order`
            bodyText.ar = `قام ${sender.name} بتحديث الطلب`
        }

        if (dataObject.request) {
            orderType = { en: "Service Request", ar: "طلب خدمة" }
            redirectType = "order"
            const existingObject = await requestRepo.get({ _id: dataObject.request })
            if (!existingObject.success) return existingObject
            receivers = sender.role != "seller" ? [existingObject.result.seller] : [existingObject.result.customer]
            receivers = [existingObject.result.seller]
            bodyText.en = `${sender.name} updated the service request ${existingObject.result.service.nameEn} from the following shop: ${existingObject.result.shop.nameEn}`
            bodyText.ar = `قام ${sender.name} بتحديث طلب الخدمة ${existingObject.result.service.nameAr} من المتجر التالي: ${existingObject.result.shop.nameAr} `
        }
        receivers.forEach((receiver) => {
            if (receiver.fcmToken) deviceTokens.push(receiver.fcmToken)
            receiversIds.push(receiver._id.toString())
        })

        notificationObject = {
            ...notificationObject,
            titleEn: `update ${orderType.en} from ${sender.name}`,
            titleAr: `${orderType.ar} معدل من ${sender.name}`,
            bodyEn: bodyText.en,
            bodyAr: bodyText.ar,
            redirectId: dataObject?.order ? dataObject.order : dataObject.request,
            redirectType: redirectType,
            type: redirectType,
            receivers: receiversIds,
            deviceTokens: deviceTokens,
            timestamp: dataObject.timestamp
        }

        let resultObject = {
            code: 200,
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