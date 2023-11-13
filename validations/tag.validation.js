const joi = require("joi")

module.exports = {

    createTagValidation: {

        body: joi.object().required().keys({
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
        })
    },


    updateTagValidation: {
        body: joi.object().required().keys({

            nameEn: joi.string().optional().messages({
                "string.base": "validNameEn",
            }),

            nameAr: joi.string().optional().messages({
                "string.base": "validNameAr",
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
        })
    }
}