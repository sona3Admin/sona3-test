const i18n = require('i18n');
const adminRepo = require("../../modules/Admin/admin.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createAdmin = async (req, res) => {
    try {
        const operationResultObject = await adminRepo.create(req.body);
        if (operationResultObject.success) delete operationResultObject.result.password;
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


exports.listAdmins = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await adminRepo.list(filterObject, { password: 0, token: 0 }, {}, pageNumber, limitNumber);
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


exports.getAdmin = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await adminRepo.get(filterObject, { password: 0, token: 0 });
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


exports.updateAdmin = async (req, res) => {
    try {
        const operationResultObject = await adminRepo.update(req.query._id, req.body);
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


exports.updateAdminRole = async (req, res) => {
    try {
        const operationResultObject = await adminRepo.update(req.query._id, { permission: req.body.permission, $unset: { token: 1 } });
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


exports.removeAdmin = async (req, res) => {
    try {
        let existingObject = await adminRepo.find({ _id: req.query._id })
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject)
        if (req.tokenData.role === "admin" && existingObject.result.role === "superAdmin") return res.status(403).json({
            success: false,
            code: 403,
            error: i18n.__("unauthorized")
        });

        const operationResultObject = await adminRepo.remove(existingObject.result._id);
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

        const existingObject = await adminRepo.find({ _id: req.query._id })
        let oldImageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false

        if (oldImageObject) await batchRepo.create({ filesToDelete: [oldImageObject.key] })

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("admins", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });

        let operationResultObject = await adminRepo.updateDirectly(req.query._id, { image: operationResultArray.result[0] });

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
        const existingObject = await adminRepo.find({ _id: req.query._id })
        let imageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false
        if (imageObject) await batchRepo.create({ filesToDelete: [imageObject.key] })
        const operationResultObject = await adminRepo.updateDirectly(req.query._id, { $unset: { image: 1 } });
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


exports.resetPassword = async (req, res) => {
    try {
        const operationResultObject = await adminRepo.resetPassword(req.body.email, req.body.newPassword);
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
