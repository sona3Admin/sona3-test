const i18n = require('i18n');
const bannerModel = require("./banner.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.find = async (filterObject) => {
    try {
        const resultObject = await bannerModel.findOne(filterObject).lean();
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
        const resultObject = await bannerModel.findOne(filterObject).lean()
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
        const resultArray = await bannerModel.find(filterObject).lean()
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await bannerModel.count(filterObject);
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
        const resultObject = new bannerModel(formObject);
        await resultObject.save();

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


exports.update = async (_id, formObject) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await bannerModel.findByIdAndUpdate({ _id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };


        return {
            success: true,
            code: 200,
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
};



exports.updateDirectly = async (_id, formObject) => {
    try {
        const resultObject = await bannerModel.findByIdAndUpdate({ _id }, formObject, { new: true })
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
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


exports.remove = async (_id) => {
    try {
        const resultObject = await bannerModel.findByIdAndDelete({ _id })

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