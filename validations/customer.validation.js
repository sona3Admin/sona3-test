const joi = require("joi");

module.exports = {

    createCustomerValidation: {
        body: joi.object().required().keys({
            name: joi.string().optional().messages({
                "string.base": "validName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2, tlds: ["com", "net", "org", "eg", "io"] })
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

            location: joi.object().optional().messages({
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

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
        })
    },


    updateCustomerValidation: {
        body: joi.object().optional().keys({
            name: joi.string().optional().empty().messages({
                "string.base": "validName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2, tlds: ["com", "net", "org", "eg", "io"] })
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

            location: joi.object().optional().messages({
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

            joinDate: joi.date().optional().messages({
                "date.base": "validJoinDate",
            }),
        }),
    },


    loginValidation: {
        body: joi.object().required().keys({
            email: joi.string()
                .email({ minDomainSegments: 2, tlds: ["com", "net", "org", "eg", "io"] })
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
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'eg', 'io'] } }).empty().required().messages({
                "string.email": "validEmail",
                "any.required": "requiredEmail",
                "string.empty": "emptyEmail"
            }),
        })
    },


    resetPasswordValidation: {
        body: joi.object().required().keys({
            email: joi.string()
                .email({ minDomainSegments: 2, tlds: ["com", "net", "org", "eg", "io"] })
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
