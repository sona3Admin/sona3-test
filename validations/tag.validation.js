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

        isRequested: joi.boolean().optional().default(false).messages({
            "boolean.base": "validStatus",
        }),

        requestedBy: joi.string().optional().messages({
            "string.base": "validSeller",
        }),

        requestDate: joi.date().optional().messages({
            "date.base": "validRequestDate",
        }),

        isActive: joi.boolean().optional().default(false).messages({
            "boolean.base": "validStatus",
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

        isRequested: joi.boolean().optional().default(false).messages({
            "boolean.base": "validStatus",
        }),

        requestedBy: joi.string().optional().messages({
            "string.base": "validSeller",
        }),

        requestDate: joi.date().optional().messages({
            "date.base": "validRequestDate",
        }),

        isActive: joi.boolean().optional().default(false).messages({
            "boolean.base": "validStatus",
        }),
    }
}