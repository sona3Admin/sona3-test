const joi = require("joi");

module.exports = {

    createServiceValidation: {
        body: joi.object().required().keys({
            seller: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            shop: joi.string().required().messages({
                "string.base": "validShop",
                "any.required": "requiredShop",
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

            basePrice: joi.number().min(0).required().messages({
                "number.base": "validItemsTotal",
                "number.min": "minItemsTotal",
                "any.required": "requiredItemsTotal",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),

            isDeliverable: joi.boolean().optional().messages({
                "boolean.base": "validIsDeliverable",
            }),

            isFood: joi.boolean().optional().messages({
                "boolean.base": "validIsFood",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

            verifyDate: joi.date().optional().messages({
                "date.base": "validVerifyDate",
            }),

            lastUpdateDate: joi.date().optional().messages({
                "date.base": "validUpdateDate",
            }),

            preparationTime: joi.number().min(0).optional().messages({
                "number.base": "validPreparationTime",
                "number.min": "minPreparationTime",
            }),

            width: joi.number().min(0).optional().messages({
                "number.base": "validWidth",
                "number.min": "minWidth",
            }),

            height: joi.number().min(0).optional().messages({
                "number.base": "validHeight",
                "number.min": "minHeight",
            }),

            length: joi.number().min(0).optional().messages({
                "number.base": "validLength",
                "number.min": "minLength",
            }),

            weight: joi.number().min(0).optional().messages({
                "number.base": "validWeight",
                "number.min": "minWeight",
            }),
        }),
    },


    updateServiceValidation: {
        body: joi.object().required().keys({
            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            shop: joi.string().optional().messages({
                "string.base": "validShop",
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

            basePrice: joi.number().min(0).optional().messages({
                "number.base": "validItemsTotal",
                "number.min": "minItemsTotal",
                "any.required": "requiredItemsTotal",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),

            isDeliverable: joi.boolean().optional().messages({
                "boolean.base": "validIsDeliverable",
            }),

            isFood: joi.boolean().optional().messages({
                "boolean.base": "validIsFood",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

            verifyDate: joi.date().optional().messages({
                "date.base": "validVerifyDate",
            }),

            lastUpdateDate: joi.date().optional().messages({
                "date.base": "validUpdateDate",
            }),

            preparationTime: joi.number().min(0).optional().messages({
                "number.base": "validPreparationTime",
                "number.min": "minPreparationTime",
            }),

            width: joi.number().min(0).optional().messages({
                "number.base": "validWidth",
                "number.min": "minWidth",
            }),

            height: joi.number().min(0).optional().messages({
                "number.base": "validHeight",
                "number.min": "minHeight",
            }),

            length: joi.number().min(0).optional().messages({
                "number.base": "validLength",
                "number.min": "minLength",
            }),

            weight: joi.number().min(0).optional().messages({
                "number.base": "validWeight",
                "number.min": "minWeight",
            }),
        })
    }
};
