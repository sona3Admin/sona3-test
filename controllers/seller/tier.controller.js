const tiersRepo = require("../../helpers/tiers.helper")
const i18n = require('i18n');
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listTiers = async (req, res) => {
    try {
        const operationResultObject = await tiersRepo.listTiers()
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