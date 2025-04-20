const i18n = require('i18n');
const firstFlightHelper = require("../utils/firstFlightSipping.util")
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