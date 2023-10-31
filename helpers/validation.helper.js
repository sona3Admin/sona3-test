module.exports = (schema) => {
    return (req, res, next) => {
        try {
            let validationResult = schema.body.validate(req.body);
            var validation = [];
            if (validationResult.error) {
                validation.push(req.__(validationResult.error.details[0].message))
            }
            if (validation.length) {
                return res.status(400).json({ success: false, error: validation.join(), code: 400 });
            }
            return next();
        }
        catch (err) {
            console.log(`err.message`, err.message);
            return res.status(400).json({ success: false, error: req.__("badRequest"), code: 400 });
        }


    }
}