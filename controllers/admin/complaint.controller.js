const i18n = require('i18n');
const complaintRepo = require("../../modules/Complaint/complaint.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listComplaints = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await complaintRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getComplaint = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await complaintRepo.get(filterObject, {});
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


exports.updateComplaint = async (req, res) => {
    try {
        const operationResultObject = await complaintRepo.update(req.query._id, req.body);
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


exports.removeComplaint = async (req, res) => {
    try {
        const operationResultObject = await complaintRepo.remove(req.query._id);
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
