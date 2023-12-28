const i18n = require('i18n');
const categoryRepo = require("../../modules/Category/category.repo");


exports.listCategories = async (req, res) => {
    try {
        let filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await categoryRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getCategory = async (req, res) => {
    try {
        let filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const operationResultObject = await categoryRepo.get(filterObject, {});
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

