const joi = require("joi");

module.exports = {
    createFormValidation: {
        body: joi.object().required().keys({
            nameEn: joi.string().required().messages({
                "string.base": "validNameEn",
                "any.required": "requiredNameEn",
            }),

            nameAr: joi.string().required().messages({
                "string.base": "validNameAr",
                "any.required": "requiredNameAr",
            }),

            descriptionEn: joi.string().optional().messages({
                "string.base": "validDescriptionEn",
            }),

            descriptionAr: joi.string().optional().messages({
                "string.base": "validDescriptionAr",
            }),

            type: joi.string().valid("product", "service").messages({
                "string.base": "validType",
                "any.only": "invalidType",
            }),

            fields: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

            categories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

            isRequested: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),

            requestedBy: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            requestDate: joi.date().messages({
                "date.base": "validRequestDate",
            }),

            isActive: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),
        }),
    },

    
    updateFormValidation: {
        body: joi.object().optional().keys({
            nameEn: joi.string().optional().empty().messages({
                "string.base": "validNameEn",
                "string.empty": "emptyNameEn",
            }),

            nameAr: joi.string().optional().empty().messages({
                "string.base": "validNameAr",
                "string.empty": "emptyNameAr",
            }),

            descriptionEn: joi.string().optional().empty().messages({
                "string.base": "validDescriptionEn",
                "string.empty": "emptyDescriptionEn",
            }),

            descriptionAr: joi.string().optional().empty().messages({
                "string.base": "validDescriptionAr",
                "string.empty": "emptyDescriptionAr",
            }),

            type: joi.string().valid("product", "service").optional().messages({
                "string.base": "validType",
                "any.only": "invalidType",
            }),

            fields: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

            categories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

            isRequested: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),

            requestedBy: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            requestDate: joi.date().optional().messages({
                "date.base": "validRequestDate",
            }),
            
            isActive: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),
        }),
    },
};
