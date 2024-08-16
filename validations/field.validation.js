const joi = require("joi");

module.exports = {

    createFieldValidation: {
        body: joi.object().required().keys({
            nameEn: joi.string().required().invalid("name").messages({
                "string.base": "validNameEn",
                "any.required": "requiredNameEn",
                "any.invalid": "invalidValue"
            }),
            nameAr: joi.string().required().invalid("الاسم", "اسم", "الأسم").messages({
                "string.base": "validNameAr",
                "any.required": "requiredNameAr",
                "any.invalid": "invalidValue"
            }),
            descriptionEn: joi.string().optional().messages({
                "string.base": "validDescriptionEn",
            }),
            descriptionAr: joi.string().optional().messages({
                "string.base": "validDescriptionAr",
            }),
            type: joi.string().required().valid("enum", "string", "number").messages({
                "string.base": "validType",
                "any.required": "requiredType",
                "any.only": "invalidType",
            }),
            values: joi.array().optional().messages({
                "array.base": "validArray",
            }),
            isRequired: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),
            // isRequested: joi.boolean().messages({
            //     "boolean.base": "validStatus",
            // }),
            // requestedBy: joi.string().optional().messages({
            //     "string.base": "validSeller",
            // }),
            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),
            
            isActive: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),
        }),
    },

    updateFieldValidation: {
        body: joi.object().required().keys({
            nameEn: joi.string().optional().invalid("name").messages({
                "string.base": "validNameEn",
                "any.invalid": "invalidValue"
            }),
            nameAr: joi.string().optional().invalid("الاسم", "اسم", "الأسم").messages({
                "string.base": "validNameAr",
                "any.invalid": "invalidValue"
            }),
            descriptionEn: joi.string().optional().messages({
                "string.base": "validDescriptionEn",
            }),
            descriptionAr: joi.string().optional().messages({
                "string.base": "validDescriptionAr",
            }),
            type: joi.string().optional().valid("enum", "string", "number").messages({
                "string.base": "validType",
                "any.only": "invalidType",
            }),
            values: joi.array().optional().messages({
                "array.base": "validArray",
            }),
            isRequired: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),
            // isRequested: joi.boolean().messages({
            //     "boolean.base": "validStatus",
            // }),
            // requestedBy: joi.string().optional().messages({
            //     "string.base": "validSeller",
            // }),
            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),
            
            isActive: joi.boolean().messages({
                "boolean.base": "validStatus",
            }),
        }),
    },

};
