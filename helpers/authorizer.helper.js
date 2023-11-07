const i18n = require('i18n');
const { permissions } = require("./permissions.helper")


exports.validatePermissions = (listOfPermissions) => {
    try {
        for (key in listOfPermissions) {
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
                console.log(key, "is not a valid permission")
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
        console.log(`err.message`, err.message);
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
            if (req.tokenData?.type == "superAdmin") return next()
            const adminPermissions = req.tokenData.role || {}
            const endPoint = req.originalUrl.split("?").shift().slice(7);
            let isFound = false
            for (key in adminPermissions) {
                if (adminPermissions[key].includes(endPoint)) { isFound = true; return next(); }
            }

            if (!isFound) return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 })

        } else return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 })
    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(403).json({ success: false, error: i18n.__("unauthorized"), code: 403 })

    }

}
