const i18n = require('i18n');
const sellerRepo = require("../../../modules/Seller/seller.repo")
const shopRepo = require("../../../modules/Shop/shop.repo")
const productRepo = require("../../../modules/Product/product.repo")
const orderRepo = require("../../../modules/Order/order.repo")
const basketRepo = require("../../../modules/Basket/basket.repo");
const { handleOrderCreation } = require("../../../helpers/order.helper")
const ifastShipperHelper = require("../../../utils/ifastShipping.util")
const stripeHelper = require("../../../utils/stripePayment.util")
const { sendOrderPurchaseConfirmationEmailToCustomer, sendOrderPurchaseConfirmationEmailToSeller } = require('../../../helpers/email.helper');


exports.createOrder = async (req, res) => {
    try {
        console.log("req.body.paymentMethod", req.body.paymentMethod)
        if (req.body?.paymentMethod == "visa") return await this.createOrderPaymentLink(req, res)

        let customerOrderObject = req.body
        let customerCartObject = await basketRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        const customerDetailsObject = customerCartObject.result.customer

        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, true, true)
        customerOrderObject["orderType"] = "basket";
        let operationResultObject = await orderRepo.create(customerOrderObject);
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        let shippingData = await ifastShipperHelper.createNewBulkOrder(customerOrderObject, false)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, operationResultObject.result)
        console.log("Saved Shipment Data")
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        // operationResultObject["orderData"] = shippingData.orderData
        basketRepo.flush({ customer: req.body.customer })
        sellerRepo.updateManyById(operationResultObject.result.sellers, { hasSold: true })
        shopRepo.updateManyById(operationResultObject.result.shops, { $inc: { orderCount: 1 }, hasSold: true })
        productRepo.updateManyById(operationResultObject.result.products, { $inc: { orderCount: 1 } })
        operationResultObject.result = operationResultObject.result.toObject()
        operationResultObject.result.customer = { ...customerDetailsObject }
        sendOrderPurchaseConfirmationEmailToCustomer(operationResultObject.result, req.lang)
        sendConfirmationEmailsToSellers(operationResultObject.result, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);
    }
    catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.createOrderPaymentLink = async (req, res) => {
    try {
        let customerOrderObject = req.body
        let customerCartObject = await basketRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, true, false)
        let costObject = { cartTotal: customerOrderObject.cartTotal, taxesTotal: customerOrderObject.taxesTotal, shippingFeesTotal: customerOrderObject.shippingFeesTotal }
        let orderDetailsObject = { basket: customerCartObject.result._id.toString() }
        let customerDetailsObject = { ...req.body }
        const orderType = "basket"
        let agent = req.query.agent || "web"
        let operationResultObject = await stripeHelper.initiateOrderPayment(costObject, customerDetailsObject, orderDetailsObject, orderType, req.body.issueDate, agent, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


async function sendConfirmationEmailsToSellers(orderDetails, lang) {
    orderDetails.subOrders.forEach(async (subOrderDetails) => {
        try {
            let shopData = await shopRepo.getWithSeller({ _id: subOrderDetails.shop.toString() }, { nameEn: 1, nameAr: 1 });
            if (shopData.success) {
                const subOrderData = {
                    _id: orderDetails._id.toString(),
                    customer: orderDetails.customer,
                    seller: shopData.result.seller,
                    shop: { nameEn: shopData.result.nameEn, nameAr: shopData.result.nameAr },
                    paymentMethod: orderDetails.paymentMethod,
                    shopTotal: subOrderDetails.shopTotal,
                    shopTaxes: subOrderDetails.shopTaxes,
                    taxesRate: orderDetails.taxesRate,
                    shopShippingFees: subOrderDetails.shopShippingFees,
                    orderTotal: subOrderDetails.subOrderTotal
                }
                sendOrderPurchaseConfirmationEmailToSeller(subOrderData, lang);
            }

        } catch (err) {
            console.error(`Failed to send confirmation email to seller with ID ${subOrderDetails}:`, err.message);
        }
    });
}