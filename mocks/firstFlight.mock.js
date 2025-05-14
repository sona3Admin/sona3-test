const i18n = require('i18n');
const firstFlightHelper = require("../utils/firstFlightSipping.util")
const orderRepo = require("../modules/Order/order.repo")
const { findObjectInArray } = require("../helpers/cart.helper")
const { logInTestEnv } = require("../helpers/logger.helper");

exports.createNewBulkOrder = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.createNewBulkOrder(req.body, false);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.createNewPickupRequest = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.createNewPickupRequest(req.body, false);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.listCities = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.listCities();
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.printLabel = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.generateOrderLabel(req.body.airwayBillNumber, req.body.printType, req.body.requestUser);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}

exports.updateOrderShipmentStatus = async (req, res) => {
    try {

        let orderObject = await orderRepo.find({ shipments: req.body.trackId })
        if (!orderObject.success) {
            return res.status(orderObject.code).json(orderObject)
        }

        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "shippingId", req.body.trackId)
        if (!subOrderObject.success) return { success: false, code: 404 }


        let subOrders
        orderObject.result.subOrders[subOrderObject.index].shippingStatus = req.body.status

        logInTestEnv("order status", orderObject.result.subOrders[subOrderObject.index].shippingStatus)
        orderObject.result.subOrders[subOrderObject.index].status = handleStatus(req.body.status, "order") || subOrderObject.result.status
        logInTestEnv("order status", orderObject.result.subOrders[subOrderObject.index].status)
        orderRepo.updateDirectly(orderObject.result._id.toString(), { subOrders: orderObject.result.subOrders })
        
        return res.status(200).json({
            status: true,
            data: {
                trackId: req.body.trackId,
                status: req.body.status
            }
        })

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            status: false
        });
    }
}


function handleStatus(firstFlightStausText, orderType) {
    let status = undefined
    if (firstFlightStausText == "Delivery") status = "delivered"
    if (firstFlightStausText == "Booking") status = "pending"
    return status
}