const joi = require("joi");

module.exports = {

    createSellerValidation: {
        body: joi.object().required().keys({

            userName: joi.string().required().messages({
                "string.base": "validNameEn",
                "any.required": "requiredNameEn",
            }),


            email: joi.string()
                .email({ minDomainSegments: 2 })
                .required().messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                }),

            password: joi.string().required().messages({
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
                coordinates: joi.array().required().messages({
                    "number.base": "validLatLocation",
                    "any.required": "requiredLatLocation"
                })

            }).optional().messages({
                "object.base": "validLocation",
            }),

            address: joi.string().optional().messages({
                "object.base": "validAddress",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),


            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
        }),
    },


    updateSellerValidation: {
        body: joi.object().optional().keys({

            userName: joi.string().optional().messages({
                "string.base": "validNameEn",
            }),

            email: joi
                .string().email({ minDomainSegments: 2 })
                .optional().messages({
                    "string.email": "validEmail",
                }),

            password: joi.string().optional().messages({
                "string.base": "validPassword",
            }),

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            location: joi.object().keys({
                coordinates: joi.array().required().messages({
                    "number.base": "validLatLocation",
                    "any.required": "requiredLatLocation"
                })

            }).optional().messages({
                "object.base": "validLocation",
            }),

            address: joi.string().optional().messages({
                "object.base": "validAddress",
            }),

            isVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),


            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            })
        }),
    },


    loginValidation: {
        body: joi.object().required().keys({
            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().required()
                .messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                }),

            password: joi.string().empty().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
                "string.empty": "emptyPassword",
            }),
        }),
    },


    sendEmailValidation: {
        body: joi.object().required().keys({
            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().required().messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                    "string.empty": "emptyEmail"
                }),
        })
    },


    resetPasswordValidation: {
        body: joi.object().required().keys({
            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().optional()
                .messages({
                    "string.email": "validEmail",
                    "string.empty": "emptyEmail",
                }),

            newPassword: joi.string().empty().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
                "string.empty": "emptyPassword",
            }),
        }),
    },
};
