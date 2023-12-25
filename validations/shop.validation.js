const joi = require("joi");

module.exports = {

    createShopValidation: {
        body: joi.object().required().keys({

            seller: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            categories: joi.array().required().messages({
                "string.base": "validCategory",
                "any.required": "requiredCategory",
            }),

            productCategories: joi.array().required().messages({
                "string.base": "validCategory",
                "any.required": "requiredCategory",
            }),

            serviceCategories: joi.array().required().messages({
                "string.base": "validCategory",
                "any.required": "requiredCategory",
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

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            location: joi.object().keys({
                type: joi.string().required().messages({
                    "string.base": "validType",
                    "any.required": "requiredType"
                }),
                coordinates: joi.array().required().messages({
                    "number.base": "validLatLocation",
                    "any.required": "requiredLatLocation"
                })

            }).optional().messages({
                "object.base": "validLocation",
            }),

            address: joi.object().optional().messages({
                "object.base": "validAddress",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            covers: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),

            banners: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            verifyDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

        }),
    },


    updateShopValidation: {
        body: joi.object().optional().keys({

            seller: joi.string().optional().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            categories: joi.array().optional().messages({
                "string.base": "validCategory",
                "any.required": "requiredCategory",
            }),

            productCategories: joi.array().optional().messages({
                "string.base": "validCategory",
            }),

            serviceCategories: joi.array().optional().messages({
                "string.base": "validCategory",
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

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            location: joi.object().keys({
                type: joi.string().required().messages({
                    "string.base": "validType",
                    "any.required": "requiredType"
                }),
                coordinates: joi.array().required().messages({
                    "number.base": "validLatLocation",
                    "any.required": "requiredLatLocation"
                })

            }).optional().messages({
                "object.base": "validLocation",
            }),

            address: joi.object().optional().messages({
                "object.base": "validAddress",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),

            rating: joi.number().min(1).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
            }),

            reviewCount: joi.number().min(0).optional().messages({
                "number.base": "validReviewCount",
                "number.min": "minReviewCount",
            }),

            covers: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),

            banners: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            verifyDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
        }),
    },

};
