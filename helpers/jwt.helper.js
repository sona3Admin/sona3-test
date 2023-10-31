let jwt = require("jsonwebtoken")

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
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tokenData) => {
                    if (err) return res.status(403).json({ success: false, error: res.__("invalidToken"), code: 403 })
                    if (!roleString.includes(tokenData.role)) return res.status(401).json({ success: false, error: res.__("unauthorized"), code: 401 })
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