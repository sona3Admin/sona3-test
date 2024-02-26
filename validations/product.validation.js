const joi = require("joi");

module.exports = {

    createProductValidation: {
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

            stock: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            variations: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

            defaultVariation: joi.string().optional().messages({
                "string.base": "validProduct",
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
                "boolean.base": "validStatus",
            }),

            isInStock: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
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

            verifyDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            lastUpdateDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
            discountValue: joi.number().optional().messages({
                "number.base": "validDiscountValue"
            }),

            width: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            height: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            length: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),
        }),
    },


    updateProductValidation: {
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

            stock: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            variations: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

            defaultVariation: joi.string().optional().messages({
                "string.base": "validProduct",
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
                "boolean.base": "validStatus",
            }),

            isInStock: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
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

            verifyDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            lastUpdateDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
            
            discountValue: joi.number().optional().messages({
                "number.base": "validDiscountValue"
            }),

            width: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            height: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            length: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),
        })
    }
};
