const i18n = require('i18n');
const complaintRepo = require("../../modules/Complaint/complaint.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createComplaint = async (req, res) => {
    try {
        const operationResultObject = await complaintRepo.create(req.body);
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