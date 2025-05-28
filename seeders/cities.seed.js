const fs = require("fs");
const path = require("path");
const cityModel = require("../modules/City/city.model");
const { logInTestEnv } = require("../helpers/logger.helper");
const dataPath = path.join(__dirname, "../cities.json");
const citiesData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const crypto = require("crypto");
const mongoose = require("mongoose");

function generateDeterministicId(input) {
    return crypto.createHash("md5").update(input).digest("hex").slice(0, 24);
}

exports.citiesSeeder = async () => {
    try {

        for (const city of citiesData) {
            city.firstFlightValues = city.firstFlightValues.map(item => ({
                ...item,
                _id: mongoose.Types.ObjectId(generateDeterministicId(item.CityName + city.nameEn))
              }));
            await cityModel.findOneAndUpdate(
                { nameEn: city.nameEn },
                city,
                { upsert: true, new: true }
            );
        }
        logInTestEnv("Cities seeded successfully");

    } catch (error) {
        logInTestEnv("Error seeding cities:", error);
    }
}
