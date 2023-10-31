const joi = require("joi")

module.exports = {

    createTagValidation: {
        nameEn: joi.string().required().messages({
            "string.base": "validNameEn",
            "any.required": "requiredNameEn",
        }),

        nameAr: joi.string().required().messages({
            "string.base": "validNameAr",
            "any.required": "requiredNameAr",
        }),
    },

    updateTagValidation: {
        nameEn: joi.string().optional().empty().messages({
            "string.base": "validNameEn",
            "any.empty": "emptyNameEn",
        }),

        nameAr: joi.string().optional().empty().messages({
            "string.base": "validNameAr",
            "any.empty": "emptyNameAr",
        }),
    }
}