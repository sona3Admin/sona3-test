const i18n = require('i18n');
const stripeHelper = require("../utils/stripePayment.util")


exports.intiateStripePayment = async (req, res) => {
    try {
        const operationResultObject = await stripeHelper.initiatePayment(req.body.cost, req.body.details);
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