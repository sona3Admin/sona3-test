const i18n = require('i18n');
const tagRepo = require("../../modules/Tag/tag.repo");


exports.createTag = async (req, res) => {
    try {
        const operationResultObject = await tagRepo.create(req.body);
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


exports.listTags = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const operationResultObject = await tagRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getTag = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        const operationResultObject = await tagRepo.get(filterObject, {});
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
