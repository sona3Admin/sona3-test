const i18n = require('i18n');
const orderRepo = require("../../modules/Order/order.repo")
const cartRepo = require("../../modules/Cart/cart.repo")
const basketRepo = require("../../modules/Basket/basket.repo")
const ifastHelper = require("../../utils/ifastShipping.util")
const firstFlightHelper = require("../../utils/firstFlightSipping.util")
const { handleOrderCreation } = require("../../helpers/order.helper")


exports.listOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await orderRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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
        const operationResultObject = await orderRepo.get(filterObject, { sellers: 0 });
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
        if (req.query.isFood == true) operationResultObject = await ifastHelper.getOrderShipmentLastStatus(req.query.shippingId);
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


exports.calculateOrderTotal = async (req, res) => {
    try {
        let cartObject, firstFlightShippingCost
        if (req.query.cart) cartObject = await cartRepo.get({ _id: req.query.cart });
        else if (req.query.basket) cartObject = await basketRepo.get({ _id: req.query.basket })
        let isFood = (req?.query?.basket) ? true : false
        let operationResultObject = await handleOrderCreation(cartObject.result, {}, isFood)

        if (!isFood && req.query?.cityCode) {
            cartObject.result.cityCode = req.query.cityCode
            firstFlightShippingCost = await firstFlightHelper.calculateOrderShippingCost(cartObject.result)
            operationResultObject.shippingFeesTotal = firstFlightShippingCost.result
            operationResultObject.orderTotal += parseFloat(firstFlightShippingCost.result.total)
        }
        return res.status(200).json({
            success: true, code: 200,
            result: {
                cartTotal: operationResultObject.cartTotal,
                // taxesRate: operationResultObject.taxesRate,
                taxesTotal: operationResultObject.taxesTotal,
                shippingFeesTotal: operationResultObject.shippingFeesTotal,
                orderTotal: operationResultObject.orderTotal
            }
        });

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}