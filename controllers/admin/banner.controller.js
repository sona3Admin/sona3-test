const i18n = require('i18n');
const bannerRepo = require("../../modules/Banner/banner.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createBanner = async (req, res) => {
    try {
        const operationResultObject = await bannerRepo.create(req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.listBanners = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await bannerRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getBanner = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await bannerRepo.get(filterObject, {});
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


exports.updateBanner = async (req, res) => {
    try {
        const operationResultObject = await bannerRepo.update(req.query._id, req.body);
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


exports.removeBanner = async (req, res) => {
    try {
        const operationResultObject = await bannerRepo.remove(req.query._id);
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

        const existingObject = await bannerRepo.find({ _id: req.query._id })
        let oldImageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false

        if (oldImageObject) await batchRepo.create({ filesToDelete: [oldImageObject.key] })

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("banners", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        let operationResultObject = await bannerRepo.updateDirectly(req.query._id, { image: operationResultArray.result[0] });
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
        const existingObject = await bannerRepo.find({ _id: req.query._id })
        let imageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false
        if (imageObject) await batchRepo.create({ filesToDelete: [imageObject.key] })
        const operationResultObject = await bannerRepo.updateDirectly(req.query._id, { $unset: { image: 1 } });
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