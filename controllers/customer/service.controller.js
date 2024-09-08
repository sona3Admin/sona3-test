const i18n = require('i18n');
const serviceRepo = require("../../modules/Service/service.repo");


exports.listServices = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        filterObject["isDeleted"] = false
        let operationResultObject = await serviceRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        if (operationResultObject.success) {
            operationResultObject.result = operationResultObject?.result.filter((service) => {
                return service.shop.isActive && service.shop.isVerified
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


exports.getService = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["isVerified"] = true
        filterObject["isDeleted"] = false
        const operationResultObject = await serviceRepo.get(filterObject, {});
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
