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


            bankAccountNumber: joi.string().optional().messages({
                "string.base": "validBankAccountNumber",
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

            isPhoneVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isEmailVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),


            isDeleted: joi.boolean().optional().messages({
                "boolean.base": "validIsDeleted",
            }),

            isSubscribed: joi.boolean().optional().messages({
                "boolean.base": "validIsSubscribed",
            }),

            payedInitialFees: joi.boolean().optional().messages({
                "boolean.base": "validPayedInitialFees",
            }),

            freeTrialApplied: joi.boolean().optional().messages({
                "boolean.base": "validFreeTrialApplied",
            }),

            type: joi.string().required().valid("product", "service").messages({
                "string.base": "validType",
            }),

            tier: joi.string().optional().valid("basic", "pro", "advanced", "lifetime").messages({
                "string.base": "validTier",
            }),

            tierDuration: joi.string().optional().valid("month", "year").messages({
                "string.base": "validTierDuration",
            }),

            session: joi.object().optional().messages({
                "object.base": "validSession",
            }),

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            verifyDate: joi.date().optional().messages({
                "date.base": "validVerifyDate",
            }),

            birthDate: joi.date().optional().messages({
                "date.base": "validBirthDate",
            }),

            subscriptionStartDate: joi.date().optional().messages({
                "date.base": "validSubscriptionStartDate",
            }),

            subscriptionEndDate: joi.date().optional().messages({
                "date.base": "validSubscriptionEndDate",
            }),

            fcmToken: joi.string().optional().empty().messages({
                "string.base": "validFcmToken",
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


            bankAccountNumber: joi.string().optional().messages({
                "string.base": "validBankAccountNumber",
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

            isPhoneVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isEmailVerified: joi.boolean().optional().messages({
                "boolean.base": "validIsVerified",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),


            isDeleted: joi.boolean().optional().messages({
                "boolean.base": "validIsDeleted",
            }),

            isSubscribed: joi.boolean().optional().messages({
                "boolean.base": "validIsSubscribed",
            }),

            payedInitialFees: joi.boolean().optional().messages({
                "boolean.base": "validPayedInitialFees",
            }),

            freeTrialApplied: joi.boolean().optional().messages({
                "boolean.base": "validFreeTrialApplied",
            }),

            type: joi.string().optional().valid("product", "service").messages({
                "string.base": "validType",
            }),

            tier: joi.string().optional().valid("basic", "pro", "advanced", "lifetime").messages({
                "string.base": "validTier",
            }),

            tierDuration: joi.string().optional().valid("month", "year").messages({
                "string.base": "validTierDuration",
            }),

            session: joi.object().optional().messages({
                "object.base": "validSession",
            }),

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            verifyDate: joi.date().optional().messages({
                "date.base": "validVerifyDate",
            }),

            birthDate: joi.date().optional().messages({
                "date.base": "validBirthDate",
            }),

            subscriptionStartDate: joi.date().optional().messages({
                "date.base": "validSubscriptionStartDate",
            }),

            subscriptionEndDate: joi.date().optional().messages({
                "date.base": "validSubscriptionEndDate",
            }),

            fcmToken: joi.string().optional().messages({
                "string.base": "validFcmToken",
            }),
        }),
    },


    loginValidation: {
        body: joi.object().required().keys({

            userName: joi.string().optional().messages({
                "string.base": "validNameEn",
                "any.required": "requiredNameEn",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().optional()
                .messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                }),

            password: joi.string().empty().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
                "string.empty": "emptyPassword",
            }),

            fcmToken: joi.string().optional().messages({
                "string.base": "validPassword",
            }),
        }),
    },


    authenticateBySocialMediaValidation: {
        body: joi.object().required().keys({
            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().required()
                .messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                }),

            userName: joi.string().optional().empty().messages({
                "string.base": "validName",
            }),

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),

            birthDate: joi.date().optional().messages({
                "date.base": "validBirthDate",
            }),

            subscriptionStartDate: joi.date().optional().messages({
                "date.base": "validSubscriptionStartDate",
            }),

            subscriptionEndDate: joi.date().optional().messages({
                "date.base": "validSubscriptionEndDate",
            }),

            fcmToken: joi.string().optional().messages({
                "string.base": "validFcmToken",
            }),

            socialToken: joi.string().optional().empty().messages({
                "string.base": "validSocialToken",
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
            type: joi.string().empty().optional().messages({
                "string.base": "validType",
                "any.required": "requiredType",
                "string.empty": "emptyType",
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

    verifyEmailUpdateValidation: {
        body: joi.object().required().keys({
            otpCode: joi.string().required().messages({
                "string.base": "validOtpCode",
                "any.required": "requiredOtpCode",
            }),
        }),
    },

    requestEmailUpdateValidation: {
        body: joi.object().required().keys({
            newEmail: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().required().messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                    "string.empty": "emptyEmail"
                }),
        }),
    },
};
