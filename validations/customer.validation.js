const joi = require("joi");

module.exports = {

    createCustomerValidation: {
        body: joi.object().required().keys({
            name: joi.string().optional().messages({
                "string.base": "validName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().required()
                .messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                }),

            password: joi.string().optional().empty().messages({
                "string.base": "validPassword",
            }),

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            // location: joi.object().keys({
            //     type: joi.string().required().messages({
            //         "string.base": "validType",
            //         "any.required": "requiredType"
            //     }),
            //     coordinates: joi.array().required().messages({
            //         "number.base": "validLatLocation",
            //         "any.required": "requiredLatLocation"
            //     })

            // }).optional().messages({
            //     "object.base": "validLocation",
            // }),

            // address: joi.object().optional().messages({
            //     "object.base": "validAddress",
            // }),

            addresses: joi.array().max(5).items(
                joi.object({
                    city: joi.string().required().messages({
                        "string.base": "validCity",
                        "any.required": "requiredCity"
                    }),
                    country: joi.string().required().messages({
                        "string.base": "validCountry",
                        "any.required": "requiredCountry"
                    }),
                    street: joi.string().required().messages({
                        "string.base": "validStreet",
                        "any.required": "requiredStreet"
                    }),
                    location: joi.object({
                        type: joi.string().valid("Point").default("Point").messages({
                            "string.base": "validType",
                            "any.required": "requiredType"
                        }),
                        coordinates: joi.array().required().messages({
                            "number.base": "validLatLocation",
                            "any.required": "requiredLatLocation"
                        })
                    }).required().messages({
                        "object.base": "validLocation",
                        "any.required": "validLocation"
                    }),
                    isDefault: joi.boolean().default(false).messages({
                        "boolean.base": "validIsDefault"
                    })
                })
            ).optional().messages({
                "array.base": "validAddresses",
                "array.max": "maxFiveAddresses"
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

            fcmToken: joi.string().optional().messages({
                "string.base": "validFcmToken",
            }),

            loyaltyPoints: joi.number().optional().empty().messages({
                "number.base": "validLoyaltyPoints",
            }),

            cashback: joi.number().optional().empty().messages({
                "number.base": "validCashback",
            }),
        })
    },

    updateCustomerValidation: {
        body: joi.object().optional().keys({
            name: joi.string().optional().empty().messages({
                "string.base": "validName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2 })
                .empty().optional()
                .messages({
                    "string.email": "validEmail",
                }),

            password: joi.string().optional().empty().messages({
                "string.base": "validPassword",
            }),

            phone: joi.string().optional().messages({
                "string.base": "validPhone",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            // location: joi.object().keys({
            //     type: joi.string().required().messages({
            //         "string.base": "validType",
            //         "any.required": "requiredType"
            //     }),
            //     coordinates: joi.array().required().messages({
            //         "number.base": "validLatLocation",
            //         "any.required": "requiredLatLocation"
            //     })

            // }).optional().messages({
            //     "object.base": "validLocation",
            // }),

            // address: joi.object().optional().messages({
            //     "object.base": "validAddress",
            // }),

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
            fcmToken: joi.string().optional().messages({
                "string.base": "validFcmToken",
            }),

            loyaltyPoints: joi.number().optional().empty().messages({
                "number.base": "validLoyaltyPoints",
            }),

            cashback: joi.number().optional().empty().messages({
                "number.base": "validCashback",
            }),
        }),
    },

    addAddressValidation: {
        body: joi.object().required().keys({
            city: joi.string().required().messages({
                "string.base": "validCity",
                "any.required": "requiredCity"
            }),
            country: joi.string().required().messages({
                "string.base": "validCountry",
                "any.required": "requiredCountry"
            }),
            street: joi.string().required().messages({
                "string.base": "validStreet",
                "any.required": "requiredStreet"
            }),
            location: joi.object({
                type: joi.string().valid("Point").default("Point").messages({
                    "string.base": "validType",
                    "any.required": "requiredType"
                }),
                coordinates: joi.array().required().messages({
                    "number.base": "validLatLocation",
                    "any.required": "requiredLatLocation"
                })
            }).required().messages({
                "object.base": "validLocation",
                "any.required": "validLocation"
            }),
            isDefault: joi.boolean().default(false).messages({
                "boolean.base": "validIsDefault"
            })
        })
    },

    updateAddressValidation: {
        body: joi.object().required().keys({
            city: joi.string().optional().messages({
                "string.base": "validCity",
            }),
            country: joi.string().optional().messages({
                "string.base": "validCountry",
            }),
            street: joi.string().optional().messages({
                "string.base": "validStreet",
            }),
            location: joi.object({
                type: joi.string().valid("Point").default("Point").messages({
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
            isDefault: joi.boolean().default(false).messages({
                "boolean.base": "validIsDefault"
            })
        })
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

            fcmToken: joi.string().optional().messages({
                "string.base": "validFcmToken",
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

            name: joi.string().optional().empty().messages({
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
            
            socialToken: joi.string().optional().empty().messages({
                "string.base": "validSocialToken",
            }),

            fcmToken: joi.string().optional().messages({
                "string.base": "validFcmToken",
            }),

        }),
    },


    sendEmailValidation: {
        body: joi.object().required().keys({
            email: joi.string().email({ minDomainSegments: 2 }).empty().required().messages({
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

};
