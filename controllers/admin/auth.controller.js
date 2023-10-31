const i18n = require('i18n');
const adminRepo = require("../../modules/Admin/admin.repo");
const jwtHelper = require("../../helpers/jwt.helper")


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const operationResultObject = await adminRepo.comparePassword(email, password);

        if (!operationResultObject.success) return res.status(operationResultObject.code).json(operationResultObject)

        payloadObject = {
            _id: operationResultObject.result._id,
            name: operationResultObject.result.name,
            email: operationResultObject.result.email,
            permissions: operationResultObject.result.permissions,
            role: operationResultObject.result.role,
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