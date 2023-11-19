const joi = require("joi");

module.exports = {

    createVariationValidation: {
        body: joi.object().required().keys({
            
            seller: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            shop: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            product: joi.string().required().messages({
                "string.base": "validProduct",
                "any.required": "requiredProduct",
            }),


            descriptionEn: joi.string().required().messages({
                "string.base": "validDescriptionEn",
                "any.required": "requiredDescriptionEn",
            }),

            descriptionAr: joi.string().required().messages({
                "string.base": "validDescriptionAr",
                "any.required": "requiredDescriptionAr",
            }),

            fields: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),


            images: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

        
            stock: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            quantity: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            price: joi.number().min(0).optional().messages({
                "number.base": "validSalePrice",
                "number.min": "minSalePrice",
            }),


            originalPrice: joi.number().min(0).optional().messages({
                "number.base": "validOriginalPrice",
                "number.min": "minOriginalPrice",
            }),


            isDefault: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            })

        }),
    },


    updateVariationValidation: {
        body: joi.object().required().keys({
            
            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            shop: joi.string().messages({
                "string.base": "validSeller",
            }),

            product: joi.string().messages({
                "string.base": "validProduct",
            }),


            descriptionEn: joi.string().messages({
                "string.base": "validDescriptionEn",
            }),

            descriptionAr: joi.string().messages({
                "string.base": "validDescriptionAr",
            }),

            fields: joi.array().items(joi.object()).optional().messages({
                "array.base": "validArray",
            }),


            images: joi.array().items(joi.string()).optional().messages({
                "array.base": "validArray",
            }),

        
            stock: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            quantity: joi.number().min(0).optional().messages({
                "number.base": "validQuantity",
                "number.min": "minQuantity",
            }),

            price: joi.number().min(0).optional().messages({
                "number.base": "validSalePrice",
                "number.min": "minSalePrice",
            }),


            originalPrice: joi.number().min(0).optional().messages({
                "number.base": "validOriginalPrice",
                "number.min": "minOriginalPrice",
            }),


            isDefault: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            }),

            isActive: joi.boolean().optional().messages({
                "boolean.base": "validStatus",
            })

        }),
    }
};
