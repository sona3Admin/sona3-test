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

        if (operationResultObject.success) {
            operationResultObject.result = operationResultObject?.result.filter((product) => {
                return product.shop.isActive && product.shop.isVerified
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


exports.getProduct = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        filterObject["defaultVariation"] = { $exists: true }
        filterObject.$expr = { $gt: [{ $size: '$variations' }, 0] }
        const operationResultObject = await productRepo.get(filterObject, {});

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
