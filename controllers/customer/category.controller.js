const i18n = require('i18n');
const categoryRepo = require("../../modules/Category/category.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listCategories = async (req, res) => {
    try {
        let filterObject = req.query;
        filterObject["isActive"] = true
        const all = req.query.all === 'true';
        let pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        if (all) {
            pageNumber = null;
            limitNumber = null;
        }
        const operationResultObject = await categoryRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getCategory = async (req, res) => {
    try {
        let filterObject = req.query;
        filterObject["isActive"] = true
        const operationResultObject = await categoryRepo.get(filterObject, {});
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

