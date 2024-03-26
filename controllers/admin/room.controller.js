const i18n = require('i18n');
const roomRepo = require("../../modules/Room/room.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")


exports.listRooms = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await roomRepo.list(filterObject, {}, { lastUpdate: -1 }, pageNumber, limitNumber);
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


exports.getRoom = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await roomRepo.get(filterObject, {});
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


exports.updateRoom = async (req, res) => {
    try {
        const operationResultObject = await roomRepo.update(req.query._id, req.body);
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


exports.removeRoom = async (req, res) => {
    try {
        const operationResultObject = await roomRepo.remove(req.query._id);
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


exports.uploadFile = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotRecieved") });

        const existingObject = await roomRepo.find({ _id: req.query._id })
        if(!existingObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("rooms", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });

        return res.status(operationResultArray.code).json(operationResultArray);

    } catch (err) {
        console.log(`err.message`, err.message);
        res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}