const i18n = require('i18n');
const cities = require("../../cities.json");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listCities = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            code: 200,
            result: cities
        });

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}