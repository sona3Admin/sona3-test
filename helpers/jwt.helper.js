let jwt = require("jsonwebtoken")
const i18n = require('i18n');
let adminRepo = require("../modules/Admin/admin.repo")
let customerRepo = require("../modules/Customer/customer.repo")
let sellerRepo = require("../modules/Seller/seller.repo")


exports.generateToken = (payloadObject, expiryTimeString) => {
    try {
        let expiresIn = expiryTimeString ? expiryTimeString : "365d"
        return jwt.sign(payloadObject, process.env.ACCESS_TOKEN_SECRET, { expiresIn })

    } catch (err) {
        console.log(`err.message`, err.message);
        return err.message
    }

}


exports.verifyToken = (roleString) => {
    return (req, res, next) => {
        try {
            let authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(" ")[1]
            if (!token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, tokenData) => {
                // console.log("token", tokenData);
                if (err) return res.status(403).json({ success: false, error: res.__("invalidToken"), code: 403 })

                if (tokenData?.role && !roleString.includes(tokenData.role)) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })

                if (tokenData?.tokenType && tokenData?.tokenType == "temp") {
                    const endPoint = req.originalUrl.split("?").shift().slice(7);
                    const allowedAPIs = ["/seller/identity", "/seller/verify", "/customer/verify"]
                    // console.log("here");
                    // console.log("endpoint", endPoint);
                    if (!allowedAPIs.includes(endPoint)) return res.status(403).json({ success: false, error: res.__("invalidToken"), code: 403 })
                }
                // if (tokenData.role == "admin") {
                //     const operationResultObject = await adminRepo.find({ _id: tokenData._id });
                //     if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 });
                // }

                // if (tokenData.role == "seller") {
                //     const operationResultObject = await sellerRepo.find({ _id: tokenData._id });
                //     if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 });
                // }

                // if (tokenData.role == "customer") {
                //     const operationResultObject = await customerRepo.find({ _id: tokenData._id });
                //     if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 });
                // }


                req.tokenData = tokenData;
                return next();
            })

        } catch (err) {
            console.log(`err.message`, err.message);
            return res.status(500).json({ success: false, error: res.__("internalServerError"), code: 401 })
        }
    }

}


exports.verifyTokenInSocket = (token, roleString) => {
    try {

        if (!token) return { success: false, error: i18n.__("unauthorized"), code: 401 }

        let tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, tokenData) => {
            if (err) return { success: false, error: i18n.__("invalidToken"), code: 403 }

            if (tokenData?.role && !roleString.includes(tokenData.role)) return { success: false, error: i18n.__("unauthorized"), code: 401 }

            return { success: true, code: 200, result: tokenData };
        })
        return tokenData

    } catch (err) {
        console.log(`err.message`, err.message);
        return { success: false, error: i18n.__("internalServerError"), code: 401 }
    }

}