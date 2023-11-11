const joi = require("joi");

module.exports = {

    createReviewValidation: {
        body: joi.object().required().keys({
            customer: joi.string().required().messages({
                "string.base": "validCustomer",
                "any.required": "requiredCustomer",
            }),

            reviewOn: joi.string().valid("shop", "product", "service").required().messages({
                "string.base": "validReviewOn",
                "any.required": "requiredReviewOn",
            }),

            shop: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            product: joi.string().optional().messages({
                "string.base": "validProduct",
            }),

            service: joi.string().optional().messages({
                "string.base": "validService",
            }),

            reviewText: joi.string().optional().messages({
                "string.base": "validReviewText",
            }),

            rating: joi.number().min(1).max(5).required().messages({
                "number.base": "validRating",
                "number.min": "minRating",
                "number.max": "maxRating",
                "any.required": "requiredRating",
            }),

            reviewDate: joi.date().optional().messages({
                "date.base": "validReviewDate",
            }),
        }),
    },


    updateReviewValidation: {
        body: joi.object().optional().keys({
            customer: joi.string().optional().messages({
                "string.base": "validCustomer",
            }),

            reviewOn: joi.string().valid("shop", "product", "service").optional().messages({
                "string.base": "validReviewOn",
            }),

            shop: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            product: joi.string().optional().messages({
                "string.base": "validProduct",
            }),

            service: joi.string().optional().messages({
                "string.base": "validService",
            }),

            reviewText: joi.string().optional().messages({
                "string.base": "validReviewText",
            }),

            rating: joi.number().min(1).max(5).optional().messages({
                "number.base": "validRating",
                "number.min": "minRating",
                "number.max": "maxRating",
            }),

            reviewDate: joi.date().optional().messages({
                "date.base": "validReviewDate",
            }),
        }),
    },

};
