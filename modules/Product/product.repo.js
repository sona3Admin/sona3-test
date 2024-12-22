const i18n = require('i18n');
const productModel = require("./product.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const shopRepo = require("../Shop/shop.repo")
const sellerRepo = require("../Seller/seller.repo")
const variationRepo = require("../Variation/variation.repo")
const { getTiers } = require("../../helpers/tiers.helper")


exports.find = async (filterObject) => {
    try {
        const resultObject = await productModel.findOne(filterObject).lean();
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
        const resultObject = await productModel.findOne(filterObject).lean()
            .populate({ path: "seller", select: "userName image fcmToken" })
            .populate({ path: "shop", select: "nameEn nameAr image isFood isVerified isActive" })
            .populate({ path: "mainCategory", select: "nameEn nameAr image" })
            .populate({ path: "categories", select: "nameEn nameAr image isSubCategory" })
            .populate({ path: "tags", select: "nameEn nameAr" })
            .populate({ path: "variations" })
            .populate({ path: "defaultVariation" })
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
        const resultArray = await productModel.find(filterObject).lean()
            .populate({ path: "seller", select: "userName image" })
            .populate({ path: "shop", select: "nameEn nameAr image isFood isVerified isActive" })
            .populate({ path: "mainCategory", select: "nameEn nameAr image" })
            .populate({ path: "categories", select: "nameEn nameAr image isSubCategory" })
            .populate({ path: "tags", select: "nameEn nameAr" })
            .populate({ path: "variations" })
            .populate({ path: "defaultVariation" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await productModel.count(filterObject);
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
        const count = await productModel.count(filterObject);
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
        let shopObject = await shopRepo.get({ _id: formObject.shop, seller: formObject.seller })
        if (shopObject.result.seller.type !== "product") return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        const tierDetails = await getTiers(`${shopObject.result.seller.tier}_${shopObject.result.seller.type}`)
        const productCount = await this.count({ seller: formObject.seller, isDeleted: false })
        if (productCount.result >= parseInt(tierDetails.numberOfItems)) return {
            success: false,
            code: 500,
            error: i18n.__("productLimitExceeded")
        }

        const uniqueObjectResult = await this.isObjectUninque(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult

        const resultObject = new productModel(formObject);
        await resultObject.save();

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        shopRepo.updateDirectly(resultObject.shop.toString(), { $addToSet: { productCategories: { $each: resultObject.categories } } })
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


exports.update = async (filterObject, formObject) => {
    try {
        const existingObject = await this.find(filterObject);
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

        const resultObject = await productModel.findByIdAndUpdate({ _id: filterObject._id }, formObject, { new: true });

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
        const resultObject = await productModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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
        const resultObject = await productModel.updateMany(filterObject, formObject)
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


exports.updateBlockState = async (filterObject, newState) => {
    try {
        const existingArray = await productModel.find(filterObject);
        const resultObject = await productModel.updateMany(filterObject, { isActive: newState })
        existingArray.forEach(async (product) => {
            variationRepo.updateBlockState({ product: product._id }, newState);
        });
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
        const existingArray = await productModel.find(filterObject);
        const resultObject = await productModel.updateMany(filterObject, { isDeleted: true, stock: 0 })
        existingArray.forEach(async (product) => {
            variationRepo.removeMany({ product: product._id });
        });
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


exports.remove = async (filterObject) => {
    try {
        const existingObject = await this.find(filterObject);
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await productModel.findByIdAndUpdate({ _id: filterObject._id }, { isDeleted: true, stock: 0 });
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
        variationRepo.removeMany({ product: filterObject._id });

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
        isDeleted: false,
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
