const i18n = require('i18n');
const variationRepo = require("../../modules/Variation/variation.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createVariation = async (req, res) => {
    try {
        const operationResultObject = await variationRepo.create(req.body);
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


exports.listVariations = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await variationRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getVariation = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        const operationResultObject = await variationRepo.get(filterObject, {});
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


exports.updateVariation = async (req, res) => {
    try {
        const operationResultObject = await variationRepo.update({ _id: req.query._id, seller: req.query.seller }, req.body);
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


exports.removeVariation = async (req, res) => {
    try {
        const operationResultObject = await variationRepo.remove({ _id: req.query._id, seller: req.query.seller });
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


exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await variationRepo.find({ _id: req.query._id, seller: req.query.seller })
        let imagesArray = (existingObject.success && existingObject.result.images) ? (existingObject.result.images) : 0
        let numberOfImages = imagesArray.length + req.files.length
        if (numberOfImages > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("variations", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        imagesArray = Array.from(imagesArray)
        imagesArray.map((cover) => {
            operationResultArray.result.push(cover)
        });
        let operationResultObject = await variationRepo.updateDirectly(req.query._id, { images: operationResultArray.result });
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


exports.deleteImages = async (req, res) => {
    try {
        const { keys } = req.body;

        const existingObject = await variationRepo.find({ _id: req.query._id, seller: req.query.seller });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { images: { key: { $in: keys } } } };
        const updateOperation = await variationRepo.updateDirectly(req.query._id, pullQuery);

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