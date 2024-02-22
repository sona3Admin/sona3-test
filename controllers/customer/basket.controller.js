const i18n = require('i18n');
const basketRepo = require("../../modules/Basket/basket.repo");


exports.getBasket = async (req, res) => {
    try {
        const operationResultObject = await basketRepo.get({ customer: req.query.customer }, {});
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


exports.addItemToBasket = async (req, res) => {
    try {
        const operationResultObject = await basketRepo.addItemToList(req.query.customer, req.query.item, req.query.quantity);
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


exports.removeItemFromBasket = async (req, res) => {
    try {
        const operationResultObject = await basketRepo.removeItemFromList(req.query.customer, req.query.shop, req.query.item, req.query.quantity);
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


exports.flushBasket = async (req, res) => {
    try {
        const operationResultObject = await basketRepo.flush(req.query);
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


exports.applyCashback = async (req, res) => {
    try {
        const operationResultObject = await basketRepo.useCashback(req.query.customer, req.query.cashback)
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


exports.redeemCashback = async (req, res) => {
    try {
        const operationResultObject = await basketRepo.redeemCashback(req.query.customer, req.query.cashback)
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