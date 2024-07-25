const i18n = require('i18n');
const firstFlightHelper = require("../utils/firstFlightSipping.util")


exports.createNewBulkOrder = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.createNewBulkOrder(req.body, false);
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


exports.createNewPickupRequest = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.createNewPickupRequest(req.body, false);
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



exports.listCities = async (req, res) => {
    try {
        const operationResultObject = await firstFlightHelper.listCities();
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