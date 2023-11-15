const i18n = require('i18n');
const shopRepo = require("../../modules/Shop/shop.repo");


exports.getShop = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const operationResultObject = await shopRepo.get(filterObject, {});
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


exports.listShops = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const operationResultObject = await shopRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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
