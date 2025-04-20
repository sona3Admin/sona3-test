const i18n = require('i18n');
const { permissions } = require("./permissions.helper")
const { logInTestEnv } = require("./logger.helper");


exports.validatePermissions = (listOfPermissions) => {
    try {
        for (let key in listOfPermissions) {
            if (permissions.get(key)) {
                let allFound = true;
                let permissionErrors = []
                listOfPermissions[key].forEach(permission => {
                    let isFound = false
                    if (permissions.get(key).has(permission)) isFound = true

                    if (!isFound) {
                        permissionErrors.push(`${permission} not found in ${key} permissions`)
                        allFound = false
                    }

                })
                if (!allFound) {
                    allFound = false
                    return {
                        success: false,
                        code: 409,
                        error: permissionErrors
                    }
                }
            }
            else {
                logInTestEnv(key, "is not a valid permission")
                return {
                    success: false,
                    code: 409,
                    error: `${key} is not a valid permission!`
                }
            }
        }
        return {
            success: true,
            code: 200
        }
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: "Unexpected Error!"
        }
    }

}


exports.isAuthorized = (req, res, next) => {
    try {
        if (req.tokenData) {
            let requesterId = req.query._id || req.body._id
            let allowedEndPoints = ["/admin/get", "/admin/password", "/admin/image"]

            if (req.tokenData?.role == "superAdmin") return next()
            const adminPermissions = req.tokenData.permission || {}
            const endPoint = req.originalUrl.split("?").shift().slice(7);
            let isFound = false
            if (allowedEndPoints.includes(endPoint) && req.tokenData._id == requesterId) return next()
            for (let key in adminPermissions) {
                if (adminPermissions[key].includes(endPoint)) { isFound = true; return next(); }
            }

            if (!isFound) return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 })

        } else return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 })
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 })

    }

}


exports.checkIdentity = (idKey) => {
    return (req, res, next) => {
        let keyToCheck = idKey || "_id";
        let requesterId = req.query[keyToCheck] || req.body[keyToCheck];
        // logInTestEnv("tokenData", req.tokenData)

        if (!req.tokenData || !req.tokenData._id || requesterId !== req.tokenData._id) return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 });
        return next();
    };
};


