const joi = require("joi");

module.exports = {

    createCategoryValidation: {
        body: joi.object().required().keys({
            nameEn: joi.string().required().messages({
                "string.base": "validNameEn",
                "any.required": "requiredNameEn",
            }),

            nameAr: joi.string().required().messages({
                "string.base": "validNameAr",
                "any.required": "requiredNameAr",
            }),

            descriptionEn: joi.string().required().messages({
                "string.base": "validDescriptionEn",
                "any.required": "requiredDescriptionEn",
            }),

            descriptionAr: joi.string().required().messages({
                "string.base": "validDescriptionAr",
                "any.required": "requiredDescriptionAr",
            }),

            type: joi.string().required().valid("seller", "product")
                .messages({
                    "string.base": "validType",
                    "any.required": "requiredType",
                    "any.only": "invalidType",
                }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            subCategories: joi.array()
                .items(joi.string()).optional()
                .messages({
                    "array.base": "validSubCategoriesArray",
                }),

            isSubCategory: joi.boolean().optional().default(false).messages({
                "boolean.base": "validIsSubCategory",
            }),
        }),
    },


    updateCategoryValidation: {
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

            type: joi.string().valid("seller", "product").optional().messages({
                "string.base": "validType",
                "any.only": "invalidType",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            subCategories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validSubCategoriesArray",
            }),
            
            isSubCategory: joi.boolean().optional().messages({
                "boolean.base": "validIsSubCategory",
            }),
        }),
    }

};
