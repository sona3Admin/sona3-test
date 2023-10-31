const joi = require("joi");

module.exports = {

    createProductValidation: {
        body: joi.object().required().keys({
            seller: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            categories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validCategoriesArray",
            }),

            tags: joi.array().items(joi.string()).optional().messages({
                "array.base": "validTagsArray",
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

            images: joi.array().items(joi.object()).optional().messages({
                "array.base": "validImagesArray",
            }),

            salePrice: joi.number().min(0).optional().messages({
                "number.base": "validSalePrice",
                "number.min": "minSalePrice",
            }),

            originalPrice: joi.number().min(0).optional().messages({
                "number.base": "validOriginalPrice",
                "number.min": "minOriginalPrice",
            }),

            quantity: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            isTopDeal: joi.boolean().optional().messages({
                "boolean.base": "validIsTopDeal",
            }),

            isInStock: joi.boolean().optional().messages({
                "boolean.base": "validIsInStock",
            }),

            isTrending: joi.boolean().optional().messages({
                "boolean.base": "validIsTrending",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),
        }),
    },


    updateProductValidation: {
        body: joi.object().optional().keys({
            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            categories: joi.array().items(joi.string()).optional().messages({
                "array.base": "validCategoriesArray",
            }),

            tags: joi.array().items(joi.string()).optional().messages({
                "array.base": "validTagsArray",
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

            images: joi.array().items(joi.object()).optional().messages({
                "array.base": "validImagesArray",
            }),

            salePrice: joi.number().min(0).optional().messages({
                "number.base": "validSalePrice",
                "number.min": "minSalePrice",
            }),

            originalPrice: joi.number().min(0).optional().messages({
                "number.base": "validOriginalPrice",
                "number.min": "minOriginalPrice",
            }),

            quantity: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            isTopDeal: joi.boolean().optional().messages({
                "boolean.base": "validIsTopDeal",
            }),

            isInStock: joi.boolean().optional().messages({
                "boolean.base": "validIsInStock",
            }),

            isTrending: joi.boolean().optional().messages({
                "boolean.base": "validIsTrending",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

        }),
    }

};
