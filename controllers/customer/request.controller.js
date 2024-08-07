const i18n = require('i18n');
const requestRepo = require("../../modules/Request/request.repo");
const ifastShipperHelper = require("../../utils/ifastShipping.util")
const firstFlightShipperHelper = require("../../utils/firstFlightSipping.util")
const { handleRequestPurchase, handleReturnService } = require("../../helpers/serviceRequest.helper")
const stripeHelper = require("../../utils/stripePayment.util")


exports.createOrderPaymentLink = async (req, res) => {
    try {
        let customerOrderObject = req.body

        let customerRequestObject = await requestRepo.get({ _id: req.query._id })
        customerOrderObject = await handleRequestPurchase(customerRequestObject.result, customerOrderObject)

        let customerDetailsObject = { ...req.body }
        let costObject = {
            cartTotal: customerOrderObject.serviceTotal,
            taxesTotal: customerOrderObject.calculations.taxesTotal,
            shippingFeesTotal: customerOrderObject.calculations.shippingFeesTotal
        }

        let orderDetailsObject = { request: customerRequestObject.result._id.toString() }
        const orderType = "request"
        let operationResultObject = await stripeHelper.initiateOrderPayment(costObject, customerDetailsObject, orderDetailsObject, orderType, req.body.issueDate)
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


exports.purchaseRequest = async (req, res) => {
    try {
        if(req.body?.paymentMethod == "visa") return await this.createOrderPaymentLink(req, res)

        let customerOrderObject = req.body

        let customerRequestObject = await requestRepo.get({ _id: req.query._id })
        customerOrderObject = await handleRequestPurchase(customerRequestObject.result, customerOrderObject)

        let operationResultObject = await requestRepo.updateDirectly(req.query._id, { ...customerOrderObject.calculations });
        // if (customerRequestObject.result.service.isFood && customerRequestObject.result.service.isDeliverable) {
        //     console.log("Ifast")
        //     let shippingData = await ifastShipperHelper.createNewBulkOrder(customerOrderObject, false)
        //     operationResultObject["orderData"] = shippingData.orderData

        //     if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        //     operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, operationResultObject.result)
        //     if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        // }
        // else if (customerRequestObject.result.service.isDeliverable && !customerRequestObject.result.service.isFood) {
        //     console.log("First Flight")
        //     let shippingData = await firstFlightShipperHelper.createServiceOrder(customerOrderObject, false)

        //     if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        //     operationResultObject = await firstFlightShipperHelper.saveShipmentData(shippingData.result, operationResultObject.result, customerOrderObject.shippingFeesTotal)
        //     if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        // }

        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.returnRequest = async (req, res) => {
    try {
        let requestObject = await requestRepo.get({ _id: req.query._id })
        if (!requestObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });

        requestObject = handleReturnService(requestObject.result)
        let operationResultObject = requestRepo.updateDirectly(req.query._id, { ...requestObject.calculations });

        if (requestObject.service.isFood) {
            let shippingData = await ifastShipperHelper.createNewBulkOrder(requestObject, true)
            if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

            operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, requestObject)
            if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
            operationResultObject["orderData"] = shippingData.orderData
        }
        else if (!requestObject.service.isFood) {
            let shippingData = await firstFlightShipperHelper.createServiceOrder(requestObject, true)
            if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
            console.log("shippingData.result", shippingData.result)
            operationResultObject = await firstFlightShipperHelper.saveShipmentData(shippingData.result, requestObject, shippingData.result.CODAmount)
            if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        }

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


exports.cancelRequest = async (req, res) => {
    try {
        let requestObject = await requestRepo.get({ _id: req.query._id })

        let operationResultObject = await ifastShipperHelper.cancelOrderShipment(requestObject.result.shippingId)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject = await requestRepo.updateDirectly(req.query._id, { status: "canceled" })
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


exports.createRequest = async (req, res) => {
    try {
        let customerRequestObject = req.body
        const operationResultObject = await requestRepo.create(customerRequestObject);
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


exports.listRequests = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await requestRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.getRequest = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await requestRepo.get(filterObject, {});
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.updateRequest = async (req, res) => {
    try {
        const operationResultObject = await requestRepo.update(req.query._id, req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.calculateRequestShippingCost = async (req, res) => {
    try {
        let requestObject = await requestRepo.get({ _id: req.query._id }, {});
        console.log("cityCode", req.body.cityCode)
        requestObject.result.cityCode = req.body.cityCode
        const operationResultObject = await firstFlightShipperHelper.calculateServiceShippingCost(requestObject.result)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.getOrderShipmentLastStatus = async (req, res) => {
    try {
        let operationResultObject
        if (req.query.isFood == true) operationResultObject = await ifastShipperHelper.getOrderShipmentLastStatus(req.query.shippingId);
        else operationResultObject = await firstFlightShipperHelper.getOrderShipmentLastStatus(req.query.shippingId);
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