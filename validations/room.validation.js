const joi = require("joi");

module.exports = {

    sendMessageValidation: {
        body: joi.object().required().keys({
            roomId: joi.string().required().messages({
                "string.base": "validRoomId",
                "any.required": "requiredRoomId",
            }),
            message: joi.object({
                customer: joi.string().optional().messages({
                    "string.base": "validCustomer",
                }),
                seller: joi.string().optional().messages({
                    "string.base": "validSeller",
                }),
                admin: joi.string().optional().messages({
                    "string.base": "validAdmin",
                }),
                text: joi.string().optional().empty().messages({
                    "string.base": "validText",
                    "string.empty": "emptyText",
                }),
                file: joi.object().optional().messages({
                    "object.base": "validFile",
                }),
                timestamp: joi.date().optional().messages({
                    "date.base": "validTimestamp",
                }),
            }).required().messages({
                "object.base": "validMessage",
                "any.required": "requiredMessage",
            }),

        }),
    },
};
