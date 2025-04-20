const i18n = require('i18n');
const wishlistRepo = require("../../modules/Wishlist/wishlist.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.getWishlist = async (req, res) => {
    try {
        const operationResultObject = await wishlistRepo.get({ customer: req.query.customer }, {});
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


exports.listWishlists = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await wishlistRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.updateWishlist = async (req, res) => {
    try {
        const operationResultObject = await wishlistRepo.update(req.query._id, req.body);
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


exports.removeWishlist = async (req, res) => {
    try {
        const operationResultObject = await wishlistRepo.remove(req.query._id);
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