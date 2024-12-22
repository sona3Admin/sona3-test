const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");


exports.getSeller = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await sellerRepo.get(filterObject, { password: 0, token: 0 });
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


exports.updateSeller = async (req, res) => {
    try {
        // req.body.isVerified = false
        const operationResultObject = await sellerRepo.update(req.query._id, req.body);
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


exports.removeSeller = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.remove(req.query._id);
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


exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await sellerRepo.find({ _id: req.query._id })
        let oldImageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false

        if (oldImageObject) await batchRepo.create({ filesToDelete: [oldImageObject.key] })

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("sellers", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        let operationResultObject = await sellerRepo.updateDirectly(req.query._id, { image: operationResultArray.result[0] });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteImage = async (req, res) => {
    try {
        const existingObject = await sellerRepo.find({ _id: req.query._id })
        let imageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false
        if (imageObject) await batchRepo.create({ filesToDelete: [imageObject.key] })
        const operationResultObject = await sellerRepo.updateDirectly(req.query._id, { $unset: { image: 1 } });
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


exports.resetPassword = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.resetPassword(req.body.email, req.body.newPassword);
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


exports.uploadIdentityImages = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await sellerRepo.find({ _id: req.query._id })
        let imagesArray = (existingObject.success && existingObject.result.identity) ? (existingObject.result.identity) : 0
        let numberOfImages = imagesArray.length + req.files.length
        if (numberOfImages > 2) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray
        if(req.query.fileType === "pdf") operationResultArray = await s3StorageHelper.uploadPDFtoS3("identity", req.files)
        if(req.query.fileType === "img") operationResultArray = await s3StorageHelper.uploadFilesToS3("identity", req.files)

        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        imagesArray = Array.from(imagesArray)
        imagesArray.map((image) => {
            operationResultArray.result.push(image)
        });
        let operationResultObject = await sellerRepo.updateDirectly(req.query._id, { identity: operationResultArray.result, isVerified: false });
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


exports.deleteIdentityImages = async (req, res) => {
    try {
        const { _id } = req.query;
        const { keys } = req.body;

        const existingObject = await sellerRepo.find({ _id });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { identity: { key: { $in: keys } } }, isVerified: false };
        const updateOperation = await sellerRepo.updateDirectly(req.query._id, pullQuery);

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