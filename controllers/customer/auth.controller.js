const i18n = require('i18n');
const customerRepo = require("../../modules/Customer/customer.repo");
const jwtHelper = require("../../helpers/jwt.helper")
const { getSettings } = require("../../helpers/settings.helper")
const emailHelper = require("../../helpers/email.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.register = async (req, res) => {
    try {
        const operationResultObject = await customerRepo.create(req.body);
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "customer",
            tokenType: "temp"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
        let otpCode = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang)
        if (otpCode.success) customerRepo.updateDirectly(operationResultObject.result._id, { token, session: { otpCode: otpCode.result } })
        return res.status(operationResultObject.code).json({ token, ...operationResultObject });

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
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
        let customerObject = { isEmailVerified: true, isPhoneVerified: req.body.phone ? true : false, ...req.body }
        let operationResultObject = await customerRepo.get({ email: req.body.email, isDeleted: false })

        if (operationResultObject.success &&
            (!operationResultObject.result.isEmailVerified ||
                // !operationResultObject.result.isPhoneVerified ||
                !operationResultObject.result.isActive ||
                operationResultObject.result.isDeleted
            )
        ) return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result })

        if (operationResultObject.code == 404) operationResultObject = await customerRepo.create(customerObject)
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "customer"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        customerRepo.updateDirectly(operationResultObject.result._id, { token, fcmToken })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
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
        const { email, password, fcmToken } = req.body;
        const operationResultObject = await customerRepo.comparePassword(email, password);

        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "customer"
        }

        if (operationResultObject.success &&
            (!operationResultObject.result.isActive || operationResultObject.result.isDeleted)
        ) return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result })

        if (operationResultObject.success &&
            (!operationResultObject.result.isEmailVerified || !operationResultObject.result.isPhoneVerified)
        ) {
            payloadObject.tokenType = "temp"
            const token = jwtHelper.generateToken(payloadObject, "1d")
            customerRepo.updateDirectly(operationResultObject.result._id, { token })
            delete operationResultObject.result["password"]
            delete operationResultObject.result["token"]
            delete operationResultObject.result["session"]
            return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result, token })
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        customerRepo.updateDirectly(operationResultObject.result._id, { token, fcmToken })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
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


exports.loginAsGuest = async (req, res) => {
    try {
        const isLifeTimePlanOn = await getSettings("isLifeTimePlanOn")
        const mostPopularPlanInProducts = await getSettings("mostPopularPlanInProducts")
        const mostPopularPlanInServices = await getSettings("mostPopularPlanInServices")
        let payload = { _id: "guest", nameEn: "Guest", nameAr: "زائر", role: "customer", isLifeTimePlanOn, mostPopularPlanInProducts, mostPopularPlanInServices }
        const token = jwtHelper.generateToken(payload);
        return res.status(200).json({ token, success: true, code: 200, result: { ...payload } })

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.sendEmailVerificationCode = async (req, res) => {
    try {
        const operationResultObject = await customerRepo.find({ email: req.body.email, isDeleted: false })
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)
        let payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
        }

        let otpCode = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang, req.body.type)
        if (otpCode.success) customerRepo.updateDirectly(payloadObject._id, { session: { otpCode: otpCode.result } })
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
        const operationResultObject = await customerRepo.find({ _id: req.query._id })
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
            role: "customer"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        delete operationResultObject.result["session"]
        customerRepo.updateDirectly(operationResultObject.result._id, { token, isEmailVerified: true })
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