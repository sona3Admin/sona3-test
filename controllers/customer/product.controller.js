const i18n = require('i18n');
const productRepo = require("../../modules/Product/product.repo");


exports.listProducts = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        filterObject["defaultVariation"] = { $exists: true }
        filterObject.$expr = { $gt: [{ $size: '$variations' }, 0] }

        let operationResultObject = await productRepo.list(filterObject, {}, {}, pageNumber, limitNumber);

        // if (operationResultObject.success) {
        //     operationResultObject.result = operationResultObject?.result.filter((product) => {
        //         console.log(product?.defaultVariation?.isActive);
        //         if (product?.defaultVariation?.isActive) return product.variations.filter(variation => variation.isActive)
        //     })
        // }

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
        
        // if (operationResultObject.success) {
        //     if (operationResultObject.result?.defaultVariation?.isActive) return operationResultObject.result.variations.filter(variation => variation.isActive)
        // }

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
