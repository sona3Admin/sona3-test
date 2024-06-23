let allowedMethods = ["GET", "PUT", "PATCH", "POST", "DELETE"];
const i18n = require('i18n')
const path = require('path');

const cors = async (req, res, next) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Vary", "Origin");
        let preferredLanguage = req.headers["accept-language"] || "en"
        req.lang = preferredLanguage
        preferredLanguage = i18n.getLocale(req, preferredLanguage);
        i18n.setLocale(req, preferredLanguage);
        i18n.setLocale(res, preferredLanguage);
        i18n.configure({
            directory: path.join(__dirname, '..', 'locales'),
            defaultLocale: preferredLanguage
        });
        // handle option request
        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods", allowedMethods.join());
            return res.status(200).json({});
        }

        if (req.url.includes("api")) return next()
        // if (req.url.includes("api") && req.headers["x-app-token"] === "Sona3-Team") return next()
        
        return res.status(500).json({ success: false, error: res.__('internalServerError'), code: 500 });

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({ success: false, error: res.__('internalServerError'), code: 500 });
    }

}

module.exports = cors;
