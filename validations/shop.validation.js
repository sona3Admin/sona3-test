const joi = require("joi");

module.exports = {

    createSellerValidation: {
        body: joi.object().required().keys({
            category: joi.string().required().messages({
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

            email: joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org", "io"] } })
                .required().messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                }),

            passwrd: joi.string().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
            }),

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            location: joi.object().keys({
                long: joi.number().required().messages({
                    "number.base": "validLongLocation",
                    "any.required": "requiredLongLocation"
                }),

                lat: joi.number().required().messages({
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

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
        }),
    },


    updateSellerValidation: {
        body: joi.object().optional().keys({
            category: joi.string().optional().messages({
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

            email: joi
                .string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org", "io"] } })
                .optional().messages({
                    "string.email": "validEmail",
                }),

            passwrd: joi.string().optional().messages({
                "string.base": "validPassword",
            }),

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            location: joi.object().keys({
                long: joi.number().required().messages({
                    "number.base": "validLongLocation",
                    "any.required": "requiredLongLocation"
                }),

                lat: joi.number().required().messages({
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

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            })
        }),
    },
    
};
