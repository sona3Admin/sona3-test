const joi = require("joi")


module.exports = {

    createAdValidation: {
        body: joi.object().required().keys({

            name: joi.string().optional().messages({
                "string.base": "validName",
                "any.required": "requiredName",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),

        }),
    },


    updateAdValidation: {
        body: joi.object().optional().keys({


            name: joi.string().optional().messages({
                "string.base": "validName",
            }),

            image: joi.object().optional().messages({
                "object.base": "validImage",
            })

        })
    }
    
}
