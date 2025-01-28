const i18n = require('i18n');
const s3StorageHelper = require('../utils/s3FileStorage.util');


exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        let operationResultObject = await s3StorageHelper.uploadFilesToS3("assets", req.files)
        if (!operationResultObject.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });

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


exports.deleteImages = async (req, res) => {
    try {
        if (!req.body || !req.body.keys || req.body.keys.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        let operationResultObject = await s3StorageHelper.deleteFilesFromS3(req.body.keys)
        if (!operationResultObject.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });

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


exports.listAssets = async (req, res) => {
    try {
        let operationResultObject = await s3StorageHelper.listFilesInS3Folder("assets")
        if (!operationResultObject.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });

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