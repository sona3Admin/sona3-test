const i18n = require('i18n');
const jwtHelper = require("../helpers/jwt.helper")
let checkToken = require("../helpers/jwt.helper").verifyHookToken;


exports.generateTokenToIfast = (req, res) => {
    try {

        if (req.headers.ifastkey != process.env.IFAST_WEBHOOK_API_KEY) return res.status(401).json({ success: false, code: 401, error: i18n.__("unauthorized") });
        const token = jwtHelper.generateToken({ ifastkey: req.headers.ifastkey }, "1d")
        return res.status(200).json({ success: true, code: 200, result: { token, expiresAfter: "1d" } })

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.updateOrderShipmentStatus = async (req, res) => {
    try {
        let authCheckResult = await checkToken(req.body.Token)
        if (!authCheckResult.success) return res.status(401).json({ success: false, code: 401, error: i18n.__("unauthorized") });
        
        return res.status(200).json({ success: true, code: 200 })

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}