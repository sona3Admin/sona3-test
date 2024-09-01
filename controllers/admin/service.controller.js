const i18n = require('i18n');
const serviceRepo = require("../../modules/Service/service.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");


exports.createService = async (req, res) => {
    try {
        const operationResultObject = await serviceRepo.create(req.body);
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


exports.listServices = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await serviceRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.countServices = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await serviceRepo.count(filterObject, {});
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
        const operationResultObject = await serviceRepo.get(filterObject, {});
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


exports.updateService = async (req, res) => {
    try {
        const operationResultObject = await serviceRepo.update({ _id: req.query._id }, req.body);
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


exports.removeService = async (req, res) => {
    try {
        const operationResultObject = await serviceRepo.remove({ _id: req.query._id });
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


exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await serviceRepo.find({ _id: req.query._id })
        let imagesArray = (existingObject.success && existingObject.result.images) ? (existingObject.result.images) : 0
        let numberOfImages = imagesArray.length + req.files.length
        if (numberOfImages > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("services", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        imagesArray = Array.from(imagesArray)
        imagesArray.map((image) => {
            operationResultArray.result.push(image)
        });
        let operationResultObject = await serviceRepo.updateDirectly(req.query._id, { images: operationResultArray.result });
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


exports.deleteImages = async (req, res) => {
    try {
        const { _id } = req.query;
        const { keys } = req.body;

        const existingObject = await serviceRepo.find({ _id });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { images: { key: { $in: keys } } } };
        const updateOperation = await serviceRepo.updateDirectly(req.query._id, pullQuery);

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