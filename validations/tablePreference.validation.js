const joi = require("joi");

module.exports = {

    createTablePreferenceValidation: {
        body: joi.object().required().keys({
            admin: joi.string().required().messages({
                "string.base": "validAdmin",
                "any.required": "requiredAdmin",
                "string.empty": "emptyAdmin",
            }),

            module: joi.string().required().empty().messages({
                "string.base": "validModule",
                "string.empty": "emptyModule",
                "any.required": "requiredModule",
            }),


            visibleColumns: joi.array().items(joi.string()).min(1).required().messages({
                "array.base": "validVisibleColumnsArray",
                "array.includes": "visibleColumnsMustBeStrings",
                "array.min": "atLeastOneVisibleColumn",
                "any.required": "requiredVisibleColumns",
            }),

        }),
    },
};
