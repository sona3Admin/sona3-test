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


exports.addItemToWishlist = async (req, res) => {
    try {
        const operationResultObject = await wishlistRepo.addItemToList(req.query.customer, req.query.item);
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


exports.removeItemFromWishlist = async (req, res) => {
    try {
        const operationResultObject = await wishlistRepo.removeItemFromList(req.query.customer, req.query.item);
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