const i18n = require('i18n');
const customerRepo = require("../../modules/Customer/customer.repo");
const jwtHelper = require("../../helpers/jwt.helper")


exports.register = async (req, res) => {
    try {
        const operationResultObject = await customerRepo.create(req.body);
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "customer",
            tokenType: "temp"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        customerRepo.updateDirectly(operationResultObject.result._id, { token })
        delete operationResultObject.result["password"]
        delete operationResultObject.result["token"]
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


exports.authenticateBySocialMediaAccount = async (req, res) => {
    try {
        let customerObject = { isEmailVerified: true, isPhoneVerified: req.body.phone ? true : false, ...req.body }
        let operationResultObject = await customerRepo.find({ email: req.body.email })
        if (operationResultObject.code == 404) operationResultObject = await customerRepo.create(customerObject)
        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "customer"
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        customerRepo.updateDirectly(operationResultObject.result._id, { token })
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
        const { email, password, fcmToken } = req.body;
        const operationResultObject = await customerRepo.comparePassword(email, password);

        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "customer"
        }

        if (!operationResultObject.result.isEmailVerified ||
            !operationResultObject.result.isPhoneVerified ||
            !operationResultObject.result.isActive) {
            payloadObject.tokenType = "temp"
            const token = jwtHelper.generateToken(payloadObject, "1d")
            customerRepo.updateDirectly(operationResultObject.result._id, { token })
            delete operationResultObject.result["password"]
            delete operationResultObject.result["token"]
            return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized"), result: operationResultObject.result, token })
        }

        const token = jwtHelper.generateToken(payloadObject, "1d")
        customerRepo.updateDirectly(operationResultObject.result._id, { token, fcmToken })
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


exports.loginAsGuest = async (req, res) => {
    try {
        let payload = { _id: "guest", nameEn: "Guest", nameAr: "زائر", role: "customer" }
        const token = jwtHelper.generateToken(payload);
        return res.status(200).json({ token, success: true, code: 200, result: { ...payload } })

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}