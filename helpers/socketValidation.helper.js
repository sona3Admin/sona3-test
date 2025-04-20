const i18n = require('i18n');
const { logInTestEnv } = require("./logger.helper");

exports.socketValidator = (schema, dataObject, locale) => {
    try {

        let validationResult = schema.body.validate(dataObject);
        var validation = [];

        if (validationResult.error) validation.push(i18n.__({
            phrase: validationResult.error.details[0].message, locale
        }))

        if (validation.length) return { success: false, error: validation.join(), code: 400 };

        return { success: true, code: 200 };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return { success: false, error: i18n.__({ phrase: "internalServerError", locale }), code: 401 }
    }

}