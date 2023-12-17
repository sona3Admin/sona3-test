const i18n = require('i18n');
const orderRepo = require("../../modules/Order/order.repo");
const { getShopOrder, listShopOrders } = require("../../helpers/order.helper")

exports.listOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        let operationResultObject = await orderRepo.list(filterObject, { customer: 1, subOrders: 1, shippingAddress: 1, paymentMethod: 1 }, {}, pageNumber, limitNumber);
        operationResultObject.result = listShopOrders(operationResultObject.result, filterObject.shop)
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
        let operationResultObject = await orderRepo.get(filterObject, { customer: 1, subOrders: 1, shippingAddress: 1, paymentMethod: 1 });
        operationResultObject.result = getShopOrder(operationResultObject.result, filterObject.shop)
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
