const i18n = require('i18n');
const orderRepo = require("../../../modules/Order/order.repo")
const cartRepo = require("../../../modules/Cart/cart.repo");
const { handleOrderCreation, handleReverseOrderCreation } = require("../../../helpers/order.helper")
const fisrtFlightShipperHelper = require("../../../utils/firstFlightSipping.util")
const stripeHelper = require("../../../utils/stripePayment.util")


exports.createOrder = async (req, res) => {
    try {
        console.log("req.body.paymentMethod", req.body.paymentMethod)
        if (req.body?.paymentMethod == "visa") return await this.createOrderPaymentLink(req, res)

        let customerOrderObject = req.body
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });

        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject)
        let operationResultObject = await orderRepo.create(customerOrderObject);
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        let shippingData = await fisrtFlightShipperHelper.createNewBulkOrder(customerOrderObject, false)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject = await fisrtFlightShipperHelper.saveShipmentData(shippingData.result, operationResultObject.result, customerOrderObject.shippingCost)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        cartRepo.flush({ customer: req.body.customer })
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


exports.returnSubOrder = async (req, res) => {
    try {
        let orderObject = await orderRepo.get({ _id: req.query._id, "subOrders._id": req.query.subOrder })
        if (!orderObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        orderObject = handleReverseOrderCreation(orderObject.result, req.query.subOrder)

        let shippingData = await fisrtFlightShipperHelper.createNewBulkOrder(orderObject, true)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        console.log("shippingData", shippingData)
        let operationResultObject = await fisrtFlightShipperHelper.saveShipmentData(shippingData.result, orderObject, shippingData.result[0].CODAmount)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

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
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, true)
        let customerDetailsObject = { ...req.body }
        let costObject = { cartTotal: customerOrderObject.cartTotal, taxesTotal: customerOrderObject.taxesTotal, shippingFeesTotal: customerDetailsObject.shippingCost.total }
        let orderDetailsObject = { cart: customerCartObject.result._id.toString() }
        const orderType = "cart"
        let operationResultObject = await stripeHelper.initiateOrderPayment(costObject, customerDetailsObject, orderDetailsObject, orderType)
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