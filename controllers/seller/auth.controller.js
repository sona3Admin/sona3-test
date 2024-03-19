const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo");
const jwtHelper = require("../../helpers/jwt.helper")


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
        const { email, password } = req.body;
        const operationResultObject = await sellerRepo.comparePassword(email, password);

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
            !operationResultObject.result.isActive) {
            payloadObject.tokenType = "temp"
            const token = jwtHelper.generateToken(payloadObject, "1d")
            sellerRepo.updateDirectly(operationResultObject.result._id, { token })
            delete operationResultObject.result["password"]
            delete operationResultObject.result["token"]
            return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result, token })
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        sellerRepo.updateDirectly(operationResultObject.result._id, { token })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
        return res.status(operationResultObject.code).json({ token, ...operationResultObject })

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
        let sellerObject = { isEmailVerified: true, isPhoneVerified: req.body.phone ? true : false, ...req.body }
        let operationResultObject = await sellerRepo.find({ email: req.body.email })
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
        sellerRepo.updateDirectly(operationResultObject.result._id, { token })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
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