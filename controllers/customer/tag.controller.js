const i18n = require('i18n');
const tagRepo = require("../../modules/Tag/tag.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listTags = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await tagRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getTag = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const operationResultObject = await tagRepo.get(filterObject, {});
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
