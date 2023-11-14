const i18n = require('i18n');
const formRepo = require("../../modules/Form/form.repo");


exports.createForm = async (req, res) => {
    try {
        const operationResultObject = await formRepo.create(req.body);
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


exports.listForms = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const operationResultObject = await formRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getForm = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        const operationResultObject = await formRepo.get(filterObject, {});
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
