const i18n = require('i18n');
const variationRepo = require("../../modules/Variation/variation.repo");


exports.listVariations = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        filterObject["isActive"] = true
        filterObject["stock"].$gte = 1
        // filterObject["isVerified"] = true
        const operationResultObject = await variationRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        if (operationResultObject.success) {
            operationResultObject.result = operationResultObject?.result.filter((variation) => {
                return variation.shop.isActive && variation.shop.isVerified
            })
        }
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
        filterObject["stock"].$gte = 1
        // filterObject["isVerified"] = true
        const operationResultObject = await variationRepo.get(filterObject, {});
        if (operationResultObject.success) {
            if (!operationResultObject.result.shop.isActive || !operationResultObject.result.shop.isVerified)
                return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        }
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
