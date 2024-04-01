const joi = require("joi");

module.exports = {

    createNotificationValidation: {
        body: joi.object().required().keys({
            admin: joi.string().optional().messages({
                "string.base": "validAdmin",
            }),

            customer: joi.string().optional().messages({
                "string.base": "validCustomer",
            }),

            toAdmin: joi.boolean().optional().messages({
                "boolean.base": "validToAdmin",
            }),

            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            receivers: joi.array().items(joi.string()).optional().messages({
                "array.base": "validReceivers",
            }),

            deviceTokens: joi.array().items(joi.string()).optional().messages({
                "array.base": "validDeviceTokens",
            }),

            seenBy: joi.array().items(joi.string()).optional().messages({
                "array.base": "validSeenByArray",
            }),

            titleEn: joi.string().required().empty().messages({
                "string.base": "validTitleEn",
                "string.empty": "emptyTitleEn",
                "any.required": "requiredTitleEn",
            }),

            titleAr: joi.string().required().empty().messages({
                "string.base": "validTitleAr",
                "string.empty": "emptyTitleAr",
                "any.required": "requiredTitleAr",
            }),

            bodyEn: joi.string().required().empty().messages({
                "string.base": "validBodyEn",
                "string.empty": "emptyBodyEn",
                "any.required": "requiredBodyEn",
            }),

            bodyAr: joi.string().required().empty().messages({
                "string.base": "validBodyAr",
                "string.empty": "emptyBodyAr",
                "any.required": "requiredBodyAr",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            link: joi.string().optional().messages({
                "string.base": "validLink",
            }),

            redirectId: joi.string().optional().messages({
                "string.base": "redirectId",
            }),

            redirectType: joi.string().optional().messages({
                "string.base": "validRedirectType",
            }),

            timestamp: joi.date().optional().messages({
                "date.base": "validTimestamp",
            }),

            startDate: joi.date().optional().messages({
                "date.base": "validStartDate",
            }),

            endDate: joi.date().optional().messages({
                "date.base": "validEndDate",
            }),

            reach: joi.number().min(0).optional().messages({
                "number.base": "requiredReach",
                "number.min": "minReach",
            }),

            clicks: joi.number().min(0).optional().messages({
                "number.base": "requiredClicks",
                "number.min": "minClicks",
            }),

            type: joi.string().optional().messages({
                "string.base": "validType",
            }),

        }),
    },
};
