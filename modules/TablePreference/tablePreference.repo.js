const i18n = require('i18n');
const tablePreferenceModel = require("./tablePreference.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");

exports.find = async (filterObject) => {
    try {
        const resultObject = await tablePreferenceModel.findOne(filterObject).lean();

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
        const resultObject = await tablePreferenceModel.findOne(filterObject).lean()
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
        const resultArray = await tablePreferenceModel.find(filterObject).lean()
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await tablePreferenceModel.count(filterObject);
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
        formObject = this.convertToLowerCase(formObject)

        const resultObject = await tablePreferenceModel.findOneAndUpdate(
            { admin: formObject.admin, module: formObject.module },
            { visibleColumns: formObject.visibleColumns },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 201,
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

exports.remove = async (_id) => {
    try {
        const resultObject = await tablePreferenceModel.findByIdAndDelete({ _id })
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

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
    const duplicateObject = await this.find({ admin: formObject.admin, module: formObject.module })

    if (duplicateObject.success) {
        if (duplicateObject.result.module.toLowerCase() === formObject.module.toLowerCase() &&
            duplicateObject.result.admin.toString() === formObject.admin.toString()) return {
                success: false,
                code: 409,
                duplicateObject: duplicateObject.result,
                error: i18n.__("moduleNameUsed")
            }
    }

    return {
        success: true,
        code: 200
    }
}


exports.convertToLowerCase = (formObject) => {
    if (formObject.module) formObject.module = formObject.module.toLowerCase()
    return formObject
}
