const joi = require("joi")


module.exports = {

    createAdminValidation: {
        body: joi.object().required().keys({

            name: joi.string().required().messages({
                "string.base": "validName",
                "any.required": "requiredName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2 })
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
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),
        })
    },


    updateAdminValidation: {
        body: joi.object().optional().keys({

            name: joi.string().optional().messages({
                "string.base": "validName",
            }),

            email: joi.string()
                .email({ minDomainSegments: 2 })
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
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validIsActive",
            }),
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

            email: joi.string()
                .email({ minDomainSegments: 2 })
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