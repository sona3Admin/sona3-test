const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo");
const jwtHelper = require("../../helpers/jwt.helper")
const { getSettings } = require("../../helpers/settings.helper")
const emailHelper = require("../../helpers/email.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");
const loginAttemptRepo = require("../../modules/LoginAttempt/loginAttempt.repo");


exports.register = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.create(req.body);
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        let payloadObject = {
            _id: operationResultObject.result._id,
            userName: operationResultObject.result.userName,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "seller",
            tokenType: "temp"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        if (operationResultObject?.result?._id) sellerRepo.updateDirectly(operationResultObject.result._id, { token })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
        let otpCode = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang)
        if (otpCode.success) sellerRepo.updateDirectly(operationResultObject.result._id, { token, session: { otpCode: otpCode.result } })
        return res.status(operationResultObject.code).json({ token, ...operationResultObject })

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.login = async (req, res) => {
    try {
        const { password, fcmToken } = req.body;
        const isLifeTimePlanOn = await getSettings("isLifeTimePlanOn")

        const operationResultObject = await sellerRepo.comparePassword(req.body.email || req.body.userName, password);

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

        let payloadObject = {
            _id: operationResultObject.result._id,
            userName: operationResultObject.result.userName,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "seller"
        }

        if (!operationResultObject.result.isEmailVerified ||
            !operationResultObject.result.isPhoneVerified ||
            !operationResultObject.result.isVerified ||
            !operationResultObject.result.isActive ||
            operationResultObject.result.isDeleted
        ) {
            payloadObject.tokenType = "temp"
            const token = jwtHelper.generateToken(payloadObject, "1d")
            sellerRepo.updateDirectly(operationResultObject.result._id, { token })
            delete operationResultObject.result["password"]
            delete operationResultObject.result["token"]
            delete operationResultObject.result["session"]
            return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result, token, isLifeTimePlanOn })
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        sellerRepo.updateDirectly(operationResultObject.result._id, { token, fcmToken })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
        return res.status(operationResultObject.code).json({ token, ...operationResultObject, isLifeTimePlanOn })

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.authenticateBySocialMediaAccount = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const isLifeTimePlanOn = await getSettings("isLifeTimePlanOn")

        let sellerObject = { isEmailVerified: true, isPhoneVerified: req.body.phone ? true : false, ...req.body }
        let operationResultObject = await sellerRepo.find({ email: req.body.email, isDeleted: false })

        if (operationResultObject.success &&
            (!operationResultObject.result.isEmailVerified ||
                !operationResultObject.result.isPhoneVerified ||
                !operationResultObject.result.isVerified ||
                !operationResultObject.result.isActive ||
                operationResultObject.result.isDeleted
            )
        ) return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result })

        if (operationResultObject.code == 404) operationResultObject = await sellerRepo.create(sellerObject)
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        let payloadObject = {
            _id: operationResultObject.result._id,
            userName: operationResultObject.result.userName,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "seller"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        sellerRepo.updateDirectly(operationResultObject.result._id, { token, fcmToken })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        return res.status(operationResultObject.code).json({ token, ...operationResultObject, isLifeTimePlanOn })

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}





exports.sendEmailVerificationCode = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.find({ email: req.body.email, isDeleted: false })
        if (!operationResultObject.success) return res.status(operationResultObject.code).json({
            success: false,
            code: operationResultObject.code,
            error: i18n.__("emailUpdateInfo")
        })
        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.userName,
            email: operationResultObject.result.email,
        }

        let otpCode = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang, req.body.type)
        if (otpCode.success) sellerRepo.updateDirectly(payloadObject._id, { session: { otpCode: otpCode.result } })
        return res.status(otpCode.code).json({ success: true, code: 200, result: payloadObject._id });
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.verifyEmailOTP = async (req, res) => {
    try {
        const providedCode = req.body.otpCode.toString()
        const operationResultObject = await sellerRepo.find({ _id: req.query._id })
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)
        if (operationResultObject.success && operationResultObject.result.session.otpCode.toString() !== providedCode) return res.status(400).json({
            success: false,
            code: 409,
            error: i18n.__("invalidOTP")
        })
        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "seller"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
        sellerRepo.updateDirectly(operationResultObject.result._id, { token, isEmailVerified: true })
        return res.status(operationResultObject.code).json({ success: true, code: 200, token });
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}

exports.requestEmailUpdate = async (req, res) => {
    try {
        const sellerId = req.query._id;
        const { newEmail } = req.body;

        const sellerObj = await sellerRepo.find({ _id: sellerId });
        if (!sellerObj.success) return res.status(sellerObj.code).json(sellerObj);

        if (sellerObj.result.email?.toLowerCase() === newEmail.toLowerCase()) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("sameEmailNotAllowed"),
            });
        }

        const existsCheck = await sellerRepo.find({ email: newEmail });
        if (existsCheck.success && existsCheck.result && existsCheck.result._id?.toString() !== sellerId?.toString()) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("emailAlreadyExists"),
            });
        }

        let payloadObject = {
            _id: sellerObj.result._id,
            userName: sellerObj.result.userName,
            email: newEmail,
            phone: sellerObj.result.phone,
            role: "seller",
        };

        const otpResp = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang, newEmail);
        if (!otpResp.success) {
            return res.status(500).json({
                success: false,
                code: 500,
                error: i18n.__("failedToSendOTP"),
            });
        }

        const emailUpdateSession = {
            newEmail,
            otpCode: otpResp.result,
            requestedAt: Date.now(),
            expiresAt: Date.now() + 10 * 60 * 1000
        };

        await sellerRepo.updateDirectly(sellerObj.result._id, {
            session: {
                ...(sellerObj.result.session || {}),
                emailUpdate: emailUpdateSession
            }
        });

        return res.status(200).json({
            success: true,
            code: 200,
            message: i18n.__("otpSentToNewEmail"),
        });

    } catch (err) {
        logInTestEnv("requestEmailUpdate.error", err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};

exports.verifyEmailUpdateOTP = async (req, res) => {
    try {
        const sellerId = req.query._id;
        const providedCode = (req.body.otpCode || "").toString();

        const sellerObj = await sellerRepo.find({ _id: sellerId });
        if (!sellerObj.success) return res.status(sellerObj.code).json(sellerObj);

        const sess = sellerObj.result.session || {};
        const emailUpdate = sess.emailUpdate;

        if (!emailUpdate || !emailUpdate.otpCode || !emailUpdate.newEmail) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: i18n.__("noPendingEmailUpdate")
            });
        }

        if (emailUpdate.otpCode.toString() !== providedCode) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("invalidOTP")
            });
        }

        const updatedEmail = emailUpdate.newEmail;

        let payloadObject = {
            _id: sellerObj.result._id,
            userName: sellerObj.result.userName || sellerObj.result.name,
            email: updatedEmail,
            phone: sellerObj.result.phone,
            role: "seller"
        };
        
        const token = jwtHelper.generateToken(payloadObject, "1d");

        await sellerRepo.updateDirectly(sellerObj.result._id, {
            email: updatedEmail,
            isEmailVerified: true,
            token,
            session: {
                ...sess,
                emailUpdate: null
            }
        });

        return res.status(200).json({
            success: true,
            code: 200,
            token,
            message: i18n.__("emailUpdatedSuccessfully")
        });

    } catch (err) {
        logInTestEnv("verifyEmailUpdateOTP.error", err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};
