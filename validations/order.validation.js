const joi = require("joi");

module.exports = {

    createOrderValidation: {
        body: joi.object().required().keys({

            customer: joi.string().optional().messages({
                "string.base": "validCustomer",
                "any.required": "requiredCustomer",
            }),

            paymentMethod: joi.string()
                .valid("cashOnDelivery", "visa")
                .messages({
                    "any.required": "requiredPaymentMethod",
                    "string.base": "validPaymentMethod",
                }),

            shippingAddress: joi.object().required().messages({
                "any.required": "requiredShippingAddress",
                "object.base": "validShippingAddress",
            }),

            shippingCost: joi.object().optional().messages({
                "object.base": "validShippingCost",
            }),

            issueDate: joi.date().messages({
                "date.base": "validIssueDate",
            }),
        }),
    },


    updateOrderValidation: {
        body: joi.object().optional().keys({
        }),
    },

};
