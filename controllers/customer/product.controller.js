const i18n = require('i18n');
const productRepo = require("../../modules/Product/product.repo");


exports.listProducts = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 6
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        filterObject["defaultVariation"] = { $exists: true }
        filterObject.$expr = { $gt: [{ $size: '$variations' }, 0] }

        let operationResultObject = await productRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        // if (operationResultObject.result) operationResultObject.result = operationResultObject?.result.filter((product) => { return product.variations.length > 0 && product?.defaultVariation })
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


exports.getProduct = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        filterObject["defaultVariation"] = { $exists: true }
        filterObject.$expr = { $gt: [{ $size: '$variations' }, 0] }
        const operationResultObject = await productRepo.get(filterObject, {});
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
