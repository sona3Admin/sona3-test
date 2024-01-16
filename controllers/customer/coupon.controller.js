const i18n = require('i18n');
const couponRepo = require("../../modules/Coupon/coupon.repo");


exports.listCoupons = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await couponRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getCoupon = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isActive"] = true
        const operationResultObject = await couponRepo.get(filterObject, {});
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
