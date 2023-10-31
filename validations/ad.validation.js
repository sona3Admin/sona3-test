const joi = require("joi")


module.exports = {

    createAdValidation: {
        body: joi.object().required().keys({

            seller: joi.string().required().messages({
                "string.base": "validSeller",
                "any.required": "requiredSeller",
            }),

            description: joi.string().required().messages({
                "string.base": "validDescription",
                "any.required": "requiredDescription",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            requestDate: joi.date().optional().messages({
                "date.base": "validRequestDate",
            })

        }),
    },


    updateAdValidation: {
        body: joi.object().optional().keys({

            seller: joi.string().optional().messages({
                "string.base": "validSeller",
            }),

            description: joi.string().optional().messages({
                "string.base": "validDescription",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

            requestDate: joi.date().optional().messages({
                "date.base": "validRequestDate",
            })

        })
    }
    
}
