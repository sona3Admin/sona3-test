const i18n = require('i18n');
const variationRepo = require("../../modules/Variation/variation.repo");


exports.listVariations = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const operationResultObject = await variationRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getVariation = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const operationResultObject = await variationRepo.get(filterObject, {});
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
