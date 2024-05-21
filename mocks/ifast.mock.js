const i18n = require('i18n');
const ifastHelper = require("../utils/ifastShipping.util")


exports.getIfastToken = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.getAuthToken();
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


exports.createNewBulkOrder = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.createNewBulkOrder();
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