const i18n = require('i18n');
const categoryModel = require("./category.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.find = async (filterObject) => {
    try {
        const resultObject = await categoryModel.findOne(filterObject).lean();
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
        const resultObject = await categoryModel.findOne(filterObject).lean()
            .populate({ path: "subCategories", select: "nameEn nameAr image descriptionEn descriptionAr isActive" })
            .populate({ path: "parentCategory", select: "nameEn nameAr image descriptionEn descriptionAr isActive" })
            // .populate({ path: "requestedBy", select: "userName image" })
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
        const resultArray = await categoryModel.find(filterObject).lean()
            .populate({ path: "subCategories", select: "nameEn nameAr image descriptionEn descriptionAr isActive" })
            .populate({ path: "parentCategory", select: "nameEn nameAr image descriptionEn descriptionAr isActive" })
            // .populate({ path: "requestedBy", select: "userName image" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await categoryModel.count(filterObject);
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
        const uniqueObjectResult = await this.isObjectUninque(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult

        const resultObject = new categoryModel(formObject);
        await resultObject.save();

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        if (resultObject.isSubCategory) this.updateDirectly(resultObject.parentCategory, { $push: { subCategories: resultObject._id } })
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

        if (formObject.nameEn || formObject.nameAr) {
            formObject.nameEn = formObject.nameEn ? formObject.nameEn : existingObject.result.nameEn;
            formObject.nameAr = formObject.nameAr ? formObject.nameAr : existingObject.result.nameAr;
            const uniqueObjectResult = await this.isNameUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        const resultObject = await categoryModel.findByIdAndUpdate({ _id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

        if (resultObject.isSubCategory) this.updateDirectly(resultObject.parentCategory, { $addToSet: { subCategories: resultObject._id } })

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
        const resultObject = await categoryModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await categoryModel.findByIdAndUpdate({ _id }, { isActive: false });
        // update shops | products | services

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

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
        type: formObject.type,
        $or: [{ nameEn: formObject.nameEn }, { nameAr: formObject.nameAr }]
    })

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


exports.isNameUnique = async (formObject, existingObject) => {

    const duplicateObject = await this.find({
        type: formObject.type,
        $or: [{ nameEn: formObject.nameEn }, { nameAr: formObject.nameAr }]
    });

    if (duplicateObject.success &&
        duplicateObject.result._id.toString() !== existingObject.result._id.toString()) {
        return {
            success: false,
            code: 409,
            error: i18n.__("nameUsed")
        }
    }

    return {
        success: true,
        code: 200,
    }
}


exports.convertToLowerCase = (formObject) => {
    if (formObject.nameEn) formObject.nameEn = formObject.nameEn.toLowerCase()
    return formObject
}
