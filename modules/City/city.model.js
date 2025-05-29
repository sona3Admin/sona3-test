const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: Array, default: [0, 0] }
    },
    iFastValue: {
        city_ID: { type: Number, required: true },
        code: { type: String, required: true },
        name: { type: String, required: true },
        name_Arabic: { type: String, required: false },
        country_ID: { type: Number, required: true },
        extend_Id: { type: Number, required: false },
    },
    firstFlightValues: [{
        CityCode: { type: String, required: true },
        CityName: { type: String, required: true },
        CountryCode: { type: String, required: true },
        CountryName: { type: String, required: true },
        State: { type: String, required: true },
    }],
})


const cityModel = mongoose.model("cities", citySchema)


module.exports = cityModel;