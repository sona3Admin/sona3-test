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
            if (!token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, tokenData) => {

                if (err) return res.status(403).json({ success: false, error: res.__("invalidToken"), code: 403 })

                if (tokenData?.role && !roleString.includes(tokenData.role)) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })

                
                const repo = `${tokenData.role}Repo`
                const operationResultObject = await repo.find({ _id: tokenData._id, token });

                if (!operationResultObject.success || operationResultObject.result.token != token) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 });

                req.tokenData = tokenData;
                return next();
            })

        } catch (err) {
            console.log(`err.message`, err.message);
            return res.status(500).json({ success: false, error: res.__("internalServerError"), code: 401 })
        }
    }

}