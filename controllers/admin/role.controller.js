const i18n = require('i18n');
const roleRepo = require("../../modules/Role/role.repo");
const adminRepo = require("../../modules/Admin/admin.repo");
const { validatePermissions } = require("../../helpers/authorizer.helper")


exports.createRole = async (req, res) => {
    try {
        const permissionValidationResultObject = validatePermissions(req.body.permissions)
        if (!permissionValidationResultObject.success) return res.status(409).json(permissionValidationResultObject);
        const operationResultObject = await roleRepo.create(req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.listRoles = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const operationResultObject = await roleRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getRole = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await roleRepo.get(filterObject, {});
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


exports.updateRole = async (req, res) => {
    try {
        const permissionValidationResultObject = validatePermissions(req.body.permissions)
        if (!permissionValidationResultObject.success) return res.status(409).json(permissionValidationResultObject);
        const operationResultObject = await roleRepo.update(req.query._id, req.body);
        await adminRepo.updateMany({ permission: req.query._id }, { $unset: { token: 1 } })
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


exports.removeRole = async (req, res) => {
    try {
        await adminRepo.updateMany({ role: req.query._id }, { $unset: { token: 1, role: 1 } })
        const operationResultObject = await roleRepo.remove(req.query._id);
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
