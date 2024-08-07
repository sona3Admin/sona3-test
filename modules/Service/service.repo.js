const i18n = require('i18n');
const serviceModel = require("./service.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const shopRepo = require("../Shop/shop.repo")


exports.find = async (filterObject) => {
    try {
        const resultObject = await serviceModel.findOne(filterObject).lean();
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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }

}


exports.get = async (filterObject, selectionObject) => {
    try {
        const resultObject = await serviceModel.findOne(filterObject).lean()
            .populate({ path: "seller", select: "userName image fcmToken" })
            .populate({ path: "shop", select: "nameEn nameAr image isFood" })
            .populate({ path: "categories", select: "nameEn nameAr image subCategories" })
            .populate({ path: "tags", select: "nameEn nameAr" })
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
        console.log(`err.message`, err.message);
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
        const resultArray = await serviceModel.find(filterObject).lean()
            .populate({ path: "seller", select: "userName image" })
            .populate({ path: "shop", select: "nameEn nameAr image isFood" })
            .populate({ path: "categories", select: "nameEn nameAr image subCategories" })
            .populate({ path: "tags", select: "nameEn nameAr" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await serviceModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.count = async (filterObject, sortObject) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        const count = await serviceModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: count
        };

    } catch (err) {
        console.log(`err.message`, err.message);
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
        let shopObject = await shopRepo.find({ _id: formObject.shop })
        if (shopObject.result.type !== "service") return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        const tierDetails = await getTiers(`${sellerObject.result.tier}_${sellerObject.result.type}`)
        const serviceCount = await this.count({ seller: formObject.seller })
        if (serviceCount.result >= parseInt(tierDetails.numberOfItems)) return {
            success: false,
            code: 500,
            error: i18n.__("serviceLimitExceeded")
        }
        const uniqueObjectResult = await this.isObjectUninque(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult

        const resultObject = new serviceModel(formObject);
        await resultObject.save();

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        shopRepo.updateDirectly(resultObject.shop.toString(), { $addToSet: { serviceCategories: { $each: resultObject.categories } } })

        return {
            success: true,
            code: 201,
            result: resultObject,
        };

    } catch (err) {
        console.log(`err.message`, err.message);
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

        const resultObject = await serviceModel.findByIdAndUpdate({ _id }, formObject, { new: true });

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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};


exports.updateDirectly = async (_id, formObject) => {
    try {
        const resultObject = await serviceModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.updateMany = async (filterObject, formObject) => {
    try {
        const resultObject = await serviceModel.updateMany(filterObject, formObject)
        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.removeMany = async (filterObject) => {
    try {
        const resultObject = await serviceModel.updateMany(filterObject, { isActive: false });
        console.log(resultObject);
        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        console.log(`err.message`, err.message);
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

        const resultObject = await serviceModel.findByIdAndUpdate({ _id }, { isActive: false });
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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.isObjectUninque = async (formObject) => {
    const duplicateObject = await this.find({
        shop: formObject.shop,
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
        shop: formObject.shop,
        $or: [{ nameEn: formObject.nameEn }, { nameAr: formObject.nameAr }]
    });

    if (duplicateObject.success &&
        duplicateObject.result._id.toString() !== existingObject.result._id.toString()) {
        return {
            success: false,
            code: 409,
            error: i18n.__("emailUsed")
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
