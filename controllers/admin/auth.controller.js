const i18n = require('i18n');
const adminRepo = require("../../modules/Admin/admin.repo");
const jwtHelper = require("../../helpers/jwt.helper")
const loginAttemptRepo = require("../../modules/LoginAttempt/loginAttempt.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const operationResultObject = await adminRepo.comparePassword(email, password);
        if (!operationResultObject.success) {
            const loginAttemptResult = await loginAttemptRepo.checkAndTrackloginAttempt(req.ip);
            if (!loginAttemptResult.success) {
                return res.status(loginAttemptResult.code).json(loginAttemptResult);
            }
        } else {
            const loginAttemptResult = await loginAttemptRepo.checkOnlyLoginBlockStatus(req.ip);
            if (!loginAttemptResult.success) {
                return res.status(loginAttemptResult.code).json(loginAttemptResult);
            }
        }


        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)
        // if (!operationResultObject.result.isActive)
        //     return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized") })

        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            permission: operationResultObject.result?.permission?.permissions,
            role: operationResultObject.result.role,
        }
        const token = jwtHelper.generateToken(payloadObject, "1d")
        if (operationResultObject.result.role == "admin") await adminRepo.updateDirectly(operationResultObject.result._id, { token })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        return res.status(operationResultObject.code).json({ token, ...operationResultObject })

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}
