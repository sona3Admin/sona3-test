const joi = require("joi");

module.exports = {

    createCouponValidation: {
        body: joi.object().required().keys({
            shop: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            nameEn: joi.string().optional().empty().messages({
                "string.base": "validNameEnString",
                "string.empty": "emptyNameEnString",
            }),

            nameAr: joi.string().optional().empty().messages({
                "string.base": "validNameArString",
                "string.empty": "emptyNameArString",
            }),

            descriptionEn: joi.string().optional().empty().messages({
                "string.base": "validDescriptionEnString",
                "string.empty": "emptyDescriptionEnString",
            }),

            descriptionAr: joi.string().optional().empty().messages({
                "string.base": "validDescriptionArString",
                "string.empty": "emptyDescriptionArString",
            }),

            code: joi.string().optional().empty().messages({
                "string.base": "validCodeString",
                "string.empty": "emptyCodeString",
            }),

            quantity: joi.number().optional().min(0).messages({
                "number.base": "validQuantity",
            }),

            value: joi.number().optional().min(0).messages({
                "number.base": "validValue",
            }),

            usedBy: joi.array().items(joi.string()).optional().messages({
                "array.base": "validUsedByArray",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

            expirationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),
        }),
    },


    updateCouponValidation: {
        body: joi.object().optional().keys({
            shop: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            nameEn: joi.string().optional().empty().messages({
                "string.base": "validNameEnString",
                "string.empty": "emptyNameEnString",
            }),

            nameAr: joi.string().optional().empty().messages({
                "string.base": "validNameArString",
                "string.empty": "emptyNameArString",
            }),

            descriptionEn: joi.string().optional().empty().messages({
                "string.base": "validDescriptionEnString",
                "string.empty": "emptyDescriptionEnString",
            }),

            descriptionAr: joi.string().optional().empty().messages({
                "string.base": "validDescriptionArString",
                "string.empty": "emptyDescriptionArString",
            }),

            code: joi.string().optional().empty().messages({
                "string.base": "validCodeString",
                "string.empty": "emptyCodeString",
            }),

            quantity: joi.number().optional().min(0).messages({
                "number.base": "validQuantity",
            }),

            value: joi.number().optional().min(0).messages({
                "number.base": "validValue",
            }),

            usedBy: joi.array().items(joi.string()).optional().messages({
                "array.base": "validUsedByArray",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),
            
            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

            expirationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),
        }),
    },
};
