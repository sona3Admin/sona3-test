const joi = require("joi");

module.exports = {

    createOrderValidation: {
        body: joi.object().required().keys({

            customer: joi.string().optional().messages({
                "string.base": "validCustomer",
                "any.required": "requiredCustomer",
            }),

            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            items: joi.array()
                .items(
                    joi.object().keys({
                        product: joi.string().required().messages({
                            "string.base": "validProduct",
                            "any.required": "requiredProduct",
                        }),
                        quantity: joi.number().min(1).required().messages({
                            "number.base": "validQuantity",
                            "number.min": "minQuantity",
                            "any.required": "requiredQuantity",
                        }),
                        itemTotal: joi.number().min(0).required().messages({
                            "number.base": "validItemTotal",
                            "number.min": "minItemTotal",
                            "any.required": "requiredItemTotal",
                        }),
                    })
                )
                .optional()
                .messages({
                    "array.base": "validItemsArray",
                    "any.required": "requiredItemsArray",
                }),

            coupon: joi.string().optional().messages({
                "string.base": "validCoupon",
            }),

            status: joi.string()
                .valid("pending", "accepted", "rejected", "in progress", "delivered", "canceled")
                .messages({
                    "string.base": "validStatus",
                }),

            paymentMethod: joi.string()
                .valid("cashOnDelivery", "visa", "others")
                .messages({
                    "string.base": "validPaymentMethod",
                }),

            shippingAddress: joi.object().messages({
                "object.base": "validShippingAddress",
            }),

            itemsTotal: joi.number().min(0).required().messages({
                "number.base": "validItemsTotal",
                "number.min": "minItemsTotal",
                "any.required": "requiredItemsTotal",
            }),

            originalItemsTotal: joi.number().min(0).required().messages({
                "number.base": "validOriginalItemsTotal",
                "number.min": "minOriginalItemsTotal",
                "any.required": "requiredOriginalItemsTotal",
            }),

            shippingFees: joi.number().min(0).messages({
                "number.base": "validShippingFees",
                "number.min": "minShippingFees",
            }),

            taxes: joi.number().min(0).messages({
                "number.base": "validTaxes",
                "number.min": "minTaxes",
            }),

            orderTotal: joi.number().min(0).required().messages({
                "number.base": "validOrderTotal",
                "number.min": "minOrderTotal",
                "any.required": "requiredOrderTotal",
            }),

            issueDate: joi.date().messages({
                "date.base": "validIssueDate",
            }),
        }),
    },


    updateOrderValidation: {
        body: joi.object().optional().keys({
            customer: joi.string().optional().messages({
                "string.base": "validCustomer",
            }),

            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            items: joi.array()
                .items(
                    joi.object().keys({
                        product: joi.string().optional().messages({
                            "string.base": "validProduct",
                        }),
                        quantity: joi.number().min(1).optional().messages({
                            "number.base": "validQuantity",
                            "number.min": "minQuantity",
                        }),
                        itemTotal: joi.number().min(0).optional().messages({
                            "number.base": "validItemTotal",
                            "number.min": "minItemTotal",
                        }),
                    })
                ).optional()
                .messages({
                    "array.base": "validItemsArray",
                }),

            coupon: joi.string().optional().messages({
                "string.base": "validCoupon",
            }),

            status: joi.string()
                .valid("pending", "accepted", "rejected", "in progress", "delivered", "canceled")
                .optional()
                .messages({
                    "string.base": "validStatus",
                }),

            paymentMethod: joi.string()
                .valid("cashOnDelivery", "visa", "others")
                .optional()
                .messages({
                    "string.base": "validPaymentMethod",
                }),

            shippingAddress: joi.object().optional().messages({
                "object.base": "validShippingAddress",
            }),

            itemsTotal: joi.number().min(0).optional().messages({
                "number.base": "validItemsTotal",
                "number.min": "minItemsTotal",
            }),

            originalItemsTotal: joi.number().min(0).optional().messages({
                "number.base": "validOriginalItemsTotal",
                "number.min": "minOriginalItemsTotal",
            }),

            shippingFees: joi.number().min(0).optional().messages({
                "number.base": "validShippingFees",
                "number.min": "minShippingFees",
            }),

            taxes: joi.number().min(0).optional().messages({
                "number.base": "validTaxes",
                "number.min": "minTaxes",
            }),

            orderTotal: joi.number().min(0).optional().messages({
                "number.base": "validOrderTotal",
                "number.min": "minOrderTotal",
            }),

            issueDate: joi.date().optional().messages({
                "date.base": "validIssueDate",
            }),
        }),
    },

};
