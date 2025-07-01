const i18n = require('i18n');
const tablePreferenceRepo = require("../../modules/TablePreference/tablePreference.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createTablePreference = async (req, res) => {
    try {
        const operationResultObject = await tablePreferenceRepo.create(req.body);
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

exports.getTablePreference = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await tablePreferenceRepo.get(filterObject, {});
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


exports.removeTablePreference = async (req, res) => {
    try {
        const operationResultObject = await tablePreferenceRepo.remove(req.query._id);
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
