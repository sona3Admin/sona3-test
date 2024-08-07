const i18n = require('i18n');
const couponRepo = require("../../modules/Coupon/coupon.repo");


exports.applyCouponOnCart = async (req, res) => {
    try {
        const operationResultObject = await couponRepo.applyOnCart(req.query.cart, req.query.coupon, req.query.shop)
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


exports.cancelCouponFromCart = async (req, res) => {
    try {
        const operationResultObject = await couponRepo.cancelFromCart(req.query.cart, req.query.shop)
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


exports.applyCouponOnBasket = async (req, res) => {
    try {
        const operationResultObject = await couponRepo.applyOnBasket(req.query.basket, req.query.coupon, req.query.shop)
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


exports.cancelCouponFromBasket = async (req, res) => {
    try {
        const operationResultObject = await couponRepo.cancelFromBasket(req.query.basket, req.query.shop)
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


exports.listCoupons = async (req, res) => {
    try {
        let filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["userType"] = "customer"
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
        let filterObject = req.query;
        filterObject["isActive"] = true
        filterObject["userType"] = "customer"
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
