const joi = require("joi");

module.exports = {

    createProductValidation: {
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

            mainCategory: joi.string().optional().messages({
                "string.base": "validMainCategory",
                "any.required": "requiredMainCategory",
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
                "string.base": "validVariation",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            // isTopDeal: joi.boolean().optional().messages({
            //     "boolean.base": "validStatus",
            // }),

            // isInStock: joi.boolean().optional().messages({
            //     "boolean.base": "validStatus",
            // }),

            isSustainable: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            hasLowerEnvironmentalImpact: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isReusable: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),


            isDeleted: joi.boolean().optional().messages({
                "boolean.base": "validIsDeleted",
            }),


            isFood: joi.boolean().required().messages({
                "boolean.base": "validIsFood",
                "any.required": "validIsFood",
            }),

            preparationTime: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
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

            discountValue: joi.number().optional().messages({
                "number.base": "validDiscountValue"
            }),

            
        }),
    },


    updateProductValidation: {
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

            mainCategory: joi.string().optional().messages({
                "string.base": "validMainCategory",
                "any.required": "requiredMainCategory",
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

            // isTopDeal: joi.boolean().optional().messages({
            //     "boolean.base": "validStatus",
            // }),

            // isInStock: joi.boolean().optional().messages({
            //     "boolean.base": "validStatus",
            // }),

            isSustainable: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            hasLowerEnvironmentalImpact: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isReusable: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),
            
            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),


            isDeleted: joi.boolean().optional().messages({
                "boolean.base": "validIsDeleted",
            }),


            isFood: joi.boolean().optional().messages({
                "boolean.base": "validIsFood",
            }),

            preparationTime: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
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

            discountValue: joi.number().optional().messages({
                "number.base": "validDiscountValue"
            }),

            
        })
    }
};
