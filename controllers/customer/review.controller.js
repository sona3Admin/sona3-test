const i18n = require('i18n');
const reviewRepo = require("../../modules/Review/review.repo");
const { defineReviewedItem } = require("../../helpers/review.helper")

exports.createReview = async (req, res) => {
    try {
        const operationResultObject = await reviewRepo.create(req.body);
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


exports.listReviews = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const operationResultObject = await reviewRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getReview = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await reviewRepo.get(filterObject, {});
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


exports.updateReview = async (req, res) => {
    try {
        const permissionValidationResultObject = validatePermissions(req.body.permissions)
        if (!permissionValidationResultObject.success) return res.status(409).json(permissionValidationResultObject);
        const operationResultObject = await reviewRepo.update(req.query._id, req.body);
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


exports.removeReview = async (req, res) => {
    try {
        await adminRepo.updateMany({ role: req.query._id }, { $unset: { token: 1, role: 1 } })
        const operationResultObject = await reviewRepo.remove(req.query._id);
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
