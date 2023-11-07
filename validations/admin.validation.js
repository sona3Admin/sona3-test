const joi = require("joi")


module.exports = {

    createAdminValidation: {
        body: joi.object().required().keys({

            name: joi.string().required().messages({
                "string.base": "validName",
                "any.required": "requiredName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'io'] } })
                .empty().required()
                .messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                    "string.empty": "emptyEmail",
                }),

            password: joi.string().empty().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
                "string.empty": "emptyPassword",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            role: joi.string().optional().messages({
                "string.base": "validPermissions",
            }),

            type: joi.string().optional().messages({
                "string.base": "validRole",
            })
        })
    },


    updateAdminValidation: {
        body: joi.object().optional().keys({

            name: joi.string().optional().messages({
                "string.base": "validName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'eg', 'io'] } })
                .empty().optional()
                .messages({
                    "string.email": "validEmail",
                    "string.empty": "emptyEmail",
                }),

            role: joi.string().optional().messages({
                "string.base": "validPermissions",
            }),

            type: joi.string().optional().messages({
                "string.base": "validRole",
            })
        }),
    },


    loginValidation: {
        body: joi.object().required().keys({

            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'eg', 'io'] } })
                .empty().required()
                .messages({
                    "string.email": "validEmail",
                    "any.required": "requiredEmail",
                    "string.empty": "emptyEmail"
                }),

            password: joi.string().empty().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
                "string.empty": "emptyPassword",
            })

        })
    },


    resetPasswordValidation: {
        body: joi.object().required().keys({

            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'eg', 'io'] } })
                .empty().optional().messages({
                    "string.email": "validEmail",
                    "string.empty": "emptyEmail"
                }),

            newPassword: joi.string().empty().required().messages({
                "string.base": "validPassword",
                "any.required": "requiredPassword",
                "string.empty": "emptyPassword",
            })

        })
    },

}