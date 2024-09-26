const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo");
const jwtHelper = require("../../helpers/jwt.helper")
const { getSettings } = require("../../helpers/settings.helper")
const emailHelper = require("../../helpers/email.helper")


exports.register = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.create(req.body);
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        payloadObject = {
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
        console.log(`err.message controller`, err.message);
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
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        payloadObject = {
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
        console.log(`err.message`, err.message);
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
        let operationResultObject = await sellerRepo.find({ email: req.body.email })

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

        payloadObject = {
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
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.authenticateByAppleAccount = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const isLifeTimePlanOn = await getSettings("isLifeTimePlanOn")

        let sellerObject = { isEmailVerified: true, isPhoneVerified: req.body.phone ? true : false, ...req.body }
        if (!req.body.email) { }
        let operationResultObject = await sellerRepo.find({ email: req.body.email })

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

        payloadObject = {
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
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.sendEmailVerificationCode = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.find({ email: req.body.email })
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)
        payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.userName,
            email: operationResultObject.result.email,
        }

        let otpCode = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang, req.body.type)
        if (otpCode.success) sellerRepo.updateDirectly(payloadObject._id, { session: { otpCode: otpCode.result } })
        return res.status(otpCode.code).json({ success: true, code: 200 });
    } catch (err) {
        console.log(`err.message`, err.message);
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
        if (operationResultObject.success && operationResultObject.result.session.otpCode.toString() !== providedCode) return res.status(401).json({
            success: false,
            code: 403,
            error: i18n.__("invalidOTP")
        })
        payloadObject = {
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
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}