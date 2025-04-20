const i18n = require('i18n');
const cartRepo = require("../../modules/Cart/cart.repo");
const firstFlightHelper = require("../../utils/firstFlightSipping.util")
const { logInTestEnv } = require("../../helpers/logger.helper");

exports.getCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.get({ customer: req.query.customer }, {});
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.addItemToCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.addItemToList(req.query.customer, req.query.item, req.query.quantity);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.removeItemFromCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.removeItemFromList(req.query.customer, req.query.shop, req.query.item, req.query.quantity);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.flushCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.reset(req.query);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.applyCashback = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.useCashback(req.query.customer, req.query.shop, req.query.cashback)
        return res.status(operationResultObject.code).json(operationResultObject);
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.redeemCashback = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.redeemCashback(req.query.customer, req.query.cashback)
        return res.status(operationResultObject.code).json(operationResultObject);
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.calculateCartShippingCost = async (req, res) => {
    try {
        let cartObject = await cartRepo.get({ customer: req.query.customer }, {});
        cartObject.result.cityCode = req.body.cityCode
        const operationResultObject = await firstFlightHelper.calculateOrderShippingCost(cartObject.result)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}