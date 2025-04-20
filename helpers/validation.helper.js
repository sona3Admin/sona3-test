const i18n = require('i18n');
const { logInTestEnv } = require("./logger.helper");


module.exports = (schema) => {
    return (req, res, next) => {
        try {
            let validationResult = schema.body.validate(req.body);
            var validation = [];
            if (validationResult.error) {
                validation.push(i18n.__(validationResult.error.details[0].message))
            }
            if (validation.length) {
                return res.status(400).json({ success: false, error: validation.join(), code: 400 });
            }
            return next();
        }
        catch (err) {
            logInTestEnv(`err.message`, err);
            return res.status(400).json({ success: false, error: req.__("badRequest"), code: 400 });
        }


    }
}