const notificationHelper = require("../helpers/notification.helper")
const notificationRepo = require("../modules/Notification/notification.repo")
const { getSettings } = require("../helpers/settings.helper")
const serviceRepo = require("../modules/Service/service.repo")
const productRepo = require("../modules/Product/product.repo")
const shopRepo = require("../modules/Shop/shop.repo")
const sellerRepo = require("../modules/Seller/seller.repo")



exports.adminSocketHandler = (socket, io, socketId, localeMessages, language) => {

    socket.on("joinAdminsRoom", (dataObject, sendAck) => {
        try {
            if (!sendAck) return
            const adminsRoomId = getSettings("adminsRoomId")
            socket.join(adminsRoomId.toString())
            return sendAck({ success: true, code: 200 })
        } catch (err) {
            console.log("err.message", err.message)
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })


    socket.on("sendStatusUpdates", async (dataObject, sendAck) => {
        try {
            console.log("Sending notification");
            if (!sendAck) return
            let actionEnumValues = ["activate", "deactivate", "changeData"]
            if (!dataObject.action || !actionEnumValues.includes(dataObject.action)) return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

            let bodyTextEn, bodyTextAr, redirectType, redirectId;
            let receiver = {}

            let bodyMessages = {
                activate: {
                    en: " is verified",
                    ar: " تم التحقق منه",
                },
                deactivate: {
                    en: " is not verified",
                    ar: " لم يتم التحقق منه"
                },
                changeData: {
                    en: " data has changed",
                    ar: " لقد تغيرت بياناته"
                },
            }
            let sender = {
                _id: socket.socketTokenData._id,
                name:  "Sona3" ,

                // name: socket.socketTokenData.role != "seller" ? "Sona3" : socket.socketTokenData.userName,
                role: socket.socketTokenData.role
            }
            // if (sender.role == "seller" && dataObject.action != "changeData") return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })


            if (dataObject.seller) {
                const existingObject = await sellerRepo.find({ _id: dataObject.seller })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result
                redirectId = dataObject.seller
                redirectType = "seller"
                bodyTextEn = "Your account" + bodyMessages[`${dataObject.action}`].en
                bodyTextAr = "الحساب الخاص بك" + bodyMessages[`${dataObject.action}`].ar
            }


            if (dataObject.shop) {
                const existingObject = await shopRepo.get({ _id: dataObject.shop })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result.seller
                redirectId = dataObject.shop
                redirectType = "shop"
                bodyTextEn = "Your shop " + `${existingObject.result.nameEn}` + bodyMessages[`${dataObject.action}`].en
                bodyTextAr = "المتجر الخاصة بك " + `${existingObject.result.nameAr}` + bodyMessages[`${dataObject.action}`].ar
            }


            if (dataObject.product) {
                const existingObject = await productRepo.get({ _id: dataObject.product })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result.seller
                redirectId = dataObject.product
                redirectType = "product"
                bodyTextEn = "Your product " + `${existingObject.result.nameEn}` + bodyMessages[`${dataObject.action}`].en
                bodyTextAr = "المنتج الخاصة بك " + `${existingObject.result.nameAr}` + bodyMessages[`${dataObject.action}`].ar
            }


            if (dataObject.service) {
                const existingObject = await serviceRepo.get({ _id: dataObject.service })
                if (!existingObject.success) return sendAck(existingObject)
                receiver = existingObject.result.seller
                redirectId = dataObject.service
                redirectType = "service"
                bodyTextEn = "Your service " + `${existingObject.result.nameEn}` + bodyMessages[`${dataObject.action}`].en
                bodyTextAr = "الخدمة الخاصة بك " + `${existingObject.result.nameAr}` + bodyMessages[`${dataObject.action}`].ar
            }


            let notificationObject = {
                admin: sender._id,
                titleEn: `New Notification from ${sender.name}`,
                titleAr: `${sender.name} إشعار جديد من`,
                bodyEn: bodyTextEn,
                bodyAr: bodyTextAr,
                redirectId: redirectId.toString(),
                redirectType: redirectType,
                type: dataObject.action,
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
            io.to(receiver._id.toString()).emit("newNotification", { success: true, code: 201, result: resultObject.result })
            notificationHelper.sendPushNotification(title, body, resultObject.result.deviceTokens)
            return sendAck(resultObject)
        } catch (err) {
            console.log("err.message", err.message)
            if (!sendAck) return
            return sendAck({ success: false, code: 500, error: localeMessages.internalServerError })
        }
    })

}