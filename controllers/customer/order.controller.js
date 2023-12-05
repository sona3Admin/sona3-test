const i18n = require('i18n');
const orderRepo = require("../../modules/Order/order.repo");
const cartRepo = require("../../modules/Cart/cart.repo")
const { handleOrderCreation } = require("../../helpers/order.helper")


exports.createOrder = async (req, res) => {
    try {
        let customerOrderObject = req.body
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject)
        const operationResultObject = await orderRepo.create(customerOrderObject);
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


exports.listOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
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
        const operationResultObject = await orderRepo.get(filterObject, {});
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
