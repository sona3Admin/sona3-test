const fs = require("fs");
const path = require("path");
const cityModel = require("../modules/City/city.model");
const { logInTestEnv } = require("../helpers/logger.helper");
const dataPath = path.join(__dirname, "../cities.json");
const citiesData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

exports.citiesSeeder = async () => {
    try {

        for (const city of citiesData) {
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
