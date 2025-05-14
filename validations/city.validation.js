const joi = require("joi");

module.exports = {

    createCityValidation: {
        body: joi.object().required().keys({
            nameEn: joi.string().required().messages({
                "string.base": "validNameEn",
                "any.required": "requiredNameEn",
            }),

            nameAr: joi.string().required().messages({
                "string.base": "validNameAr",
                "any.required": "requiredNameAr",
            }),

            iFastValue: joi.object().optional().keys({
                city_ID: joi.number().required().messages({
                    "number.base": "validCityID",
                    "any.required": "requiredCityID",
                }),
                code: joi.string().required().messages({
                    "string.base": "validCode",
                    "any.required": "requiredCode",
                }),
                name: joi.string().required().messages({
                    "string.base": "validName",
                    "any.required": "requiredName",
                }),
                name_Arabic: joi.string().optional().messages({
                    "string.base": "validNameAr",
                }),
                country_ID: joi.number().required().messages({
                    "number.base": "validCountryID",
                    "any.required": "requiredCountryID",
                }),
                extend_Id: joi.number().optional().messages({
                    "number.base": "validExtendID",
                }),
            }),

            firstFlightValues: joi.array().items(
                joi.object().required().keys({
                    CityCode: joi.string().required().messages({
                        "string.base": "validCityCode",
                        "any.required": "requiredCityCode",
                    }),
                    CityName: joi.string().required().messages({
                        "string.base": "validCityName",
                        "any.required": "requiredCityName",
                    }),
                    CountryCode: joi.string().required().messages({
                        "string.base": "validCountryCode",
                        "any.required": "requiredCountryCode",
                    }),
                    CountryName: joi.string().required().messages({
                        "string.base": "validCountryName",
                        "any.required": "requiredCountryName",
                    }),
                    State: joi.string().required().messages({
                        "string.base": "validState",
                        "any.required": "requiredState",
                    }),
                })
            ).optional().messages({
                "array.base": "validFirstFlightValues",
            }),
        }),
    },


    addFirstFlightCityValidation: {
        body: joi.object().required().keys({
            CityCode: joi.string().required().messages({
                "string.base": "validCityCode",
                "any.required": "requiredCityCode",
            }),
            CityName: joi.string().required().messages({
                "string.base": "validCityName",
                "any.required": "requiredCityName",
            }),
            CountryCode: joi.string().required().messages({
                "string.base": "validCountryCode",
                "any.required": "requiredCountryCode",
            }),
            CountryName: joi.string().required().messages({
                "string.base": "validCountryName",
                "any.required": "requiredCountryName",
            }),
            State: joi.string().required().messages({
                "string.base": "validState",
                "any.required": "requiredState",
            }),
        }),
    },

    addIfastCityValidation: {
        body: joi.object().required().keys({
            city_ID: joi.number().required().messages({
                "number.base": "validCityID",
                "any.required": "requiredCityID",
            }),
            code: joi.string().required().messages({
                "string.base": "validCode",
                "any.required": "requiredCode",
            }),
            name: joi.string().required().messages({
                "string.base": "validName",
                "any.required": "requiredName",
            }),
            name_Arabic: joi.string().optional().messages({
                "string.base": "validNameArabic",
            }),
            country_ID: joi.number().required().messages({
                "number.base": "validCountryID",
                "any.required": "requiredCountryID",
            }),
            extend_Id: joi.number().optional().messages({
                "number.base": "validExtendID",
            }),
        }),
    },

}
