const i18n = require('i18n');
const variationRepo = require("../../modules/Variation/variation.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listVariations = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        filterObject["isDeleted"] = false
        filterObject["stock"] = { $gte: 1 }

        const operationResultObject = await variationRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        if (operationResultObject.success) {
            operationResultObject.result = operationResultObject?.result.filter((variation) => {
                return variation.shop.isActive && variation.shop.isVerified
            })
        }
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

exports.getVariationPriceRange = async (req, res) => {
    try {
        const filterObject = {
            isDeleted: false,
            stock: { $gte: 1 },
        }
        const selectObject = { 'defaultPackage.price': 1 }
        let sortObject = {
            "defaultPackage.price": 1
        }
        const minVariation = await variationRepo.list(filterObject, selectObject, sortObject, 1, 1);
        if (!minVariation.success) return res.status(minVariation.code).json(minVariation);
        sortObject = {
            "defaultPackage.price": -1
        }
        const maxVariation = await variationRepo.list(filterObject, selectObject, sortObject, 1, 1, true);
        if (!maxVariation.success) return res.status(maxVariation.code).json(maxVariation);
        const minPrice = minVariation.result[0]?.defaultPackage?.price || 0;
        const maxPrice = maxVariation.result[0]?.defaultPackage?.price || 0;
        const operationResultObject = {
            success: true,
            code: 200,
            result: {
                minPrice,
                maxPrice
            }
        }
        
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



exports.getVariation = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        filterObject["stock"] = { $gte: 1 }

        const operationResultObject = await variationRepo.get(filterObject, {});
        if (operationResultObject.success) {
            if (!operationResultObject.result.shop.isActive || !operationResultObject.result.shop.isVerified)
                return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        }
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
