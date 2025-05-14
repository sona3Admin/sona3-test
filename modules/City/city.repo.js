const i18n = require('i18n');
const cityModel = require("./city.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");
const path = require("path");
const fs = require("fs");
const filePath = path.join(__dirname, "../../cities.json");
const citiesJson = JSON.parse(fs.readFileSync(filePath, "utf8"));


exports.find = async (filterObject) => {
    try {
        const resultObject = await cityModel.findOne(filterObject).lean();
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        }

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }

}


exports.get = async (filterObject, selectionObject) => {
    try {
        const resultObject = await cityModel.findOne(filterObject).lean()
            .select(selectionObject)

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject,
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.list = async (filterObject, selectionObject, sortObject, pageNumber, limitNumber) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        sortObject = normalizedQueryObjects.sortObject
        const resultArray = await cityModel.find(filterObject).lean()
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await cityModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.create = async (formObject) => {
    try {
        const uniqueObjectResult = await this.isObjectUninque(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult
        logInTestEnv(`uniqueObjectResult`, uniqueObjectResult);
        citiesJson.push({
            nameEn: formObject.nameEn,
            nameAr: formObject.nameAr,
            iFastValue: formObject.iFastValue? formObject.iFastValue : null,
            firstFlightValues: formObject.firstFlightValues? formObject.firstFlightValues : []
        });

        fs.writeFileSync(filePath, JSON.stringify(citiesJson, null, 2), "utf8");
        const resultObject = await cityModel.create(formObject);
        return {
            success: true,
            code: 201,
            result: resultObject
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.addIfastCity = async (_id, formObject) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const index = citiesJson.findIndex((item) => item.nameEn === existingObject.result.nameEn);
        if (index !== -1) {
            citiesJson[index] = {
                ...citiesJson[index], iFastValue: formObject
            };
        } else {
            citiesJson.push({
                nameEn: existingObject.result.nameEn,
                nameAr: existingObject.result.nameAr,
                iFastValue: formObject,
                firstFlightValues: []
            });
        }
        fs.writeFileSync(filePath, JSON.stringify(citiesJson, null, 2), "utf8");

        const result = await cityModel.findOneAndUpdate({ _id }, { iFastValue: formObject }, { new: true });

        return {
            success: true,
            code: 200,
            result: result
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}

exports.removeIfastCity = async (_id) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const index = citiesJson.findIndex((item) => item.nameEn === existingObject.result.nameEn);
        if (index !== -1) {
            citiesJson[index] = {
                ...citiesJson[index], iFastValue: null
            };
        }

        fs.writeFileSync(filePath, JSON.stringify(citiesJson, null, 2), "utf8");
        const result = await cityModel.findOneAndUpdate({ _id }, { iFastValue: null }, { new: true });

        return {
            success: true,
            code: 200,
            result: result
        };
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.addFirstFlightCity = async (_id, formObject) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };
        let firstFlightValues = [];

        const index = citiesJson.findIndex((item) => item.nameEn === existingObject.result.nameEn);
        if (index !== -1) {
            firstFlightValues = citiesJson[index].firstFlightValues || [];
            const existingCity = firstFlightValues.find((item) => item.CityName === formObject.CityName);
            if (existingCity) {
                firstFlightValues = firstFlightValues.map((item) => item.CityName === formObject.CityName ? { ...item, ...formObject } : item);
            } else {
                firstFlightValues.push(formObject);
            }
            citiesJson[index] = {
                ...citiesJson[index], firstFlightValues
            };
        } else {
            citiesJson.push({
                nameEn: existingObject.result.nameEn,
                nameAr: existingObject.result.nameAr,
                iFastValue: null,
                firstFlightValues: [formObject]
            });
            firstFlightValues.push(formObject);
        }

        fs.writeFileSync(filePath, JSON.stringify(citiesJson, null, 2), "utf8");
        if (firstFlightValues.length > 0) {
            await cityModel.updateOne({ _id }, { firstFlightValues: firstFlightValues });
        } else {
            await cityModel.create({
                nameEn: existingObject.result.nameEn,
                nameAr: existingObject.result.nameAr,
                iFastValue: null,
                firstFlightValues: [formObject]
            });
        }

        const result = await this.find({ nameEn: existingObject?.result?.nameEn });

        return {
            success: true,
            code: 200,
            result: result
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

    }
}

exports.removeFirstFlightCity = async (_id, CityName) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };
        let firstFlightValues = [];

        const index = citiesJson.findIndex((item) => item.nameEn === existingObject.result.nameEn);
        if (index !== -1) {
            firstFlightValues = citiesJson[index].firstFlightValues || [];
            firstFlightValues = firstFlightValues.filter((item) => item.CityName !== CityName);
            citiesJson[index] = {
                ...citiesJson[index], firstFlightValues
            };
        }

        fs.writeFileSync(filePath, JSON.stringify(citiesJson, null, 2), "utf8");

        if (firstFlightValues.length > 0) {
            await cityModel.updateOne({ _id }, { firstFlightValues: firstFlightValues });
        }
        
        const result = await this.find({ nameEn: existingObject.result.nameEn });

        return {
            success: true,
            code: 200,
            result: result
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}

exports.remove = async (_id) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const index = citiesJson.findIndex((item) => item.nameEn === existingObject.result.nameEn);
        if (index !== -1) {
            citiesJson.splice(index, 1);
        }
        fs.writeFileSync(filePath, JSON.stringify(citiesJson, null, 2), "utf8");
        await cityModel.deleteOne({ _id });
        

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("recordDeleted") }
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}

exports.isObjectUninque = async (formObject) => {
    const duplicateObject = await this.find({
        $or: [
            { nameEn: formObject.nameEn },
            { nameAr: formObject.nameAr }
        ]
    });

    if (duplicateObject.success) {
        if (duplicateObject.result.nameEn == formObject.nameEn || duplicateObject.result.nameAr == formObject.nameAr) return {
            success: false,
            code: 409,
            error: i18n.__("nameUsed")
        }
    }

    return {
        success: true,
        code: 200
    }
}