const i18n = require('i18n');
const shopRepo = require("../../modules/Shop/shop.repo");
const sellerRepo = require("../../modules/Seller/seller.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");
const emailHelper = require("../../helpers/email.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.create(req.body);
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


exports.getShop = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await shopRepo.get(filterObject, {});
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


exports.listShops = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await shopRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.countShops = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await shopRepo.count(filterObject, {});
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


exports.updateShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.update({ _id: req.query._id }, req.body);

        if (req?.body?.isVerified == true) {
            const sellerObject = await sellerRepo.find({ _id: (operationResultObject.result.seller).toString() })
            emailHelper.sendShopVerificationConfirmation(sellerObject.result, req.lang)
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


exports.updateShopBlockSate = async (req, res) => {
    try {
        if (!req.query.isActive) req.query.isActive = false
        const operationResultObject = await shopRepo.updateBlockState({ _id: req.query._id }, req.query.isActive);
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


exports.removeShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.remove({ _id: req.query._id });
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


exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id })
        let oldImageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false

        if (oldImageObject) await batchRepo.create({ filesToDelete: [oldImageObject.key] })

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("shops", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { image: operationResultArray.result[0] });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteImage = async (req, res) => {
    try {
        const existingObject = await shopRepo.find({ _id: req.query._id })
        let imageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false
        if (imageObject) await batchRepo.create({ filesToDelete: [imageObject.key] })
        const operationResultObject = await shopRepo.updateDirectly(req.query._id, { $unset: { image: 1 } });
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


exports.uploadCovers = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id })
        let coversArray = (existingObject.success && existingObject.result.covers) ? (existingObject.result.covers) : 0
        let numberOfCovers = coversArray.length + req.files.length
        if (numberOfCovers > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("shopCovers", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        coversArray = Array.from(coversArray)
        coversArray.map((cover) => {
            operationResultArray.result.push(cover)
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { covers: operationResultArray.result });
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


exports.deleteCovers = async (req, res) => {
    try {
        const { _id } = req.query;
        const { keys } = req.body;

        const existingObject = await shopRepo.find({ _id });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { covers: { key: { $in: keys } } } };
        const updateOperation = await shopRepo.updateDirectly(req.query._id, pullQuery);

        if (!updateOperation.success) return res.status(updateOperation.code).json(updateOperation);


        batchRepo.create({ filesToDelete: keys });

        return res.status(updateOperation.code).json(updateOperation);

    } catch (err) {
        console.error(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};



exports.uploadBanners = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id })
        let bannersArray = (existingObject.success && existingObject.result.banners) ? (existingObject.result.banners) : 0
        let numberOfbanners = bannersArray.length + req.files.length
        if (numberOfbanners > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("banners", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        bannersArray = Array.from(bannersArray)
        bannersArray.map((banner) => {
            operationResultArray.result.push(banner)
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { banners: operationResultArray.result });
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


exports.deleteBanners = async (req, res) => {
    try {
        const { _id } = req.query;
        const { keys } = req.body;

        const existingObject = await shopRepo.find({ _id });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { banners: { key: { $in: keys } } } };
        const updateOperation = await shopRepo.updateDirectly(req.query._id, pullQuery);

        if (!updateOperation.success) return res.status(updateOperation.code).json(updateOperation);


        batchRepo.create({ filesToDelete: keys });

        return res.status(updateOperation.code).json(updateOperation);

    } catch (err) {
        console.error(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}