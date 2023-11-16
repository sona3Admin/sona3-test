let jwt = require("jsonwebtoken")
let adminRepo = require("../modules/Admin/admin.repo")
let customerRepo = require("../modules/Customer/customer.repo")
let sellerRepo = require("../modules/Seller/seller.repo")


exports.generateToken = (payloadObject, expiryTimeString) => {
    try {
        expiresIn = expiryTimeString ? expiryTimeString : "365d"
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
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, tokenData) => {
                    
                    if (err) return res.status(403).json({ success: false, error: res.__("invalidToken"), code: 403 })
                    
                    if (tokenData?.type && !roleString.includes(tokenData.type)) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })
                    
                    if (!tokenData?.type && tokenData?.role && !roleString.includes(tokenData.role)) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })
                    
                    if (tokenData?.type == "admin") {
                        const operationResultObject = await adminRepo.find({ _id: tokenData._id });
                        if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })
                    }

                    if (tokenData?.role == "customer") {
                        const operationResultObject = await customerRepo.find({ _id: tokenData._id });
                        if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })
                    }

                    if (tokenData?.role == "seller") {
                        const operationResultObject = await sellerRepo.find({ _id: tokenData._id });
                        if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })
                    }

                    req.tokenData = tokenData;
                    return next();
                })
            }

            else return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })

        } catch (err) {
            console.log(`err.message`, err.message);
            return res.status(500).json({ success: false, error: res.__("internalServerError"), code: 401 })
        }
    }

}