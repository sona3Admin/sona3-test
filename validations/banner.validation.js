const joi = require("joi");

module.exports = {

    createBannerValidation: {
        body: joi.object().required().keys({
            name: joi.string().optional().empty().messages({
                "string.base": "validNameString",
                "string.empty": "emptyNameString",
            }),
            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),
        }),
    },


    updateBannerValidation: {
        body: joi.object().optional().keys({
            name: joi.string().optional().empty().messages({
                "string.base": "validNameString",
                "string.empty": "emptyNameString",
            }),
            image: joi.object().optional().messages({
                "object.base": "validImage",
            }),
        })
    }
    
}
