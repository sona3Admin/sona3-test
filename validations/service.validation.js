const joi = require("joi");

module.exports = {

    createServiceValidation: {
        body: joi.object().required().keys({
            seller: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            shop: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),


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

            categories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validCategoriesArray",
            }),

            tags: joi.array().items(joi.string()).optional().messages({
                "array.base": "validTagsArray",
            }),

            fields: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),


            images: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),


            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            isTrending: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),
        
            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),
        }),
    },


    updateServiceValidation: {
        body: joi.object().required().keys({
            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            shop: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            nameEn: joi.string().optional().messages({
                "string.base": "validNameEn",
            }),

            nameAr: joi.string().optional().messages({
                "string.base": "validNameAr",
            }),

            descriptionEn: joi.string().optional().messages({
                "string.base": "validDescriptionEn",
            }),

            descriptionAr: joi.string().optional().messages({
                "string.base": "validDescriptionAr",
            }),

            categories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validCategoriesArray",
            }),

            tags: joi.array().items(joi.string()).optional().messages({
                "array.base": "validTagsArray",
            }),

            fields: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),


            images: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            isTrending: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),
        })
    }
};
