const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo");
const jwtHelper = require("../../helpers/jwt.helper")


exports.register = async (req, res) => {
    try {
        const operationResultObject = await sellerRepo.create(req.body);
        if (operationResultObject.success) delete operationResultObject.result.password;
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


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const operationResultObject = await sellerRepo.comparePassword(email, password);

        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        if (!operationResultObject.result.isActive)
            return res.status(401).json({ success: false, code: 401, error: res.__("unauthorized") })

        payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            phone: operationResultObject.result.phone,
            role: "seller"
        }

        const token = jwtHelper.generateToken(payloadObject, "30d")
        delete operationResultObject.result["password"]
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
