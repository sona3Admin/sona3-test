const i18n = require('i18n');
const orderRepo = require("../../modules/Order/order.repo");
const { getShopOrder, getSellerOrder, listShopOrders, listSellerOrders } = require("../../helpers/order.helper")
const ifastHelper = require("../../utils/ifastShipping.util")
const firstFlightHelper = require("../../utils/firstFlightSipping.util")


exports.listOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        if (filterObject.seller) filterObject.sellers = filterObject.seller
        let operationResultObject = await orderRepo.list(filterObject, { customer: 1, subOrders: 1, shippingAddress: 1, paymentMethod: 1, issueDate: 1 }, {}, pageNumber, limitNumber);
        if (filterObject.seller) operationResultObject.result = listSellerOrders(operationResultObject.result, filterObject.seller)
        if (filterObject.shops) operationResultObject.result = listShopOrders(operationResultObject.result, filterObject.shops)
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


exports.getOrder = async (req, res) => {
    try {
        const filterObject = req.query;
        let operationResultObject = await orderRepo.get(filterObject, { customer: 1, subOrders: 1, shippingAddress: 1, paymentMethod: 1, issueDate: 1 });
        if (filterObject.seller) operationResultObject.result = getSellerOrder(operationResultObject.result, filterObject.seller)
        if (filterObject.shops) operationResultObject.result = getShopOrder(operationResultObject.result, filterObject.shops)
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


exports.updateOrder = async (req, res) => {
    try {
        const operationResultObject = await orderRepo.update(req.query._id, req.body);
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
        if(req.query.isFood == true) operationResultObject = await ifastHelper.getOrderShipmentLastStatus(req.query.shippingId);
        else operationResultObject = await firstFlightHelper.getOrderShipmentLastStatus(req.query.shippingId);
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