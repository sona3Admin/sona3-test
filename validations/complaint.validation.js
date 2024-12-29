const joi = require("joi");

module.exports = {

    createComplaintValidation: {
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
                }),

            body: joi.string().required().messages({
                "string.base": "validDescription",
                "any.required": "requiredDescription",
            }),

            creationDate: joi.date().optional().messages({
                "date.base": "validCreationDate",
            }),

        }),
    },


    updateComplaintValidation: {
        body: joi.object().required().keys({

            isRead: joi.boolean().optional().messages({
                "boolean.base": "validIsRead",
            }),


            isResolved: joi.boolean().optional().messages({
                "boolean.base": "validIsResolved",
            }),

        }),
    },




};
