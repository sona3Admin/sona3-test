const i18n = require('i18n');
const mongoose = require("mongoose");
let shopModel = require("./shop.model")
const { prepareQueryObjects } = require("../../helpers/query.helper");
const sellerRepo = require('../Seller/seller.repo');
const productRepo = require('../Product/product.repo');
const serviceRepo = require('../Service/service.repo');
const couponRepo = require('../Coupon/coupon.repo');


exports.find = async (filterObject) => {
    try {
        const resultObject = await shopModel.findOne(filterObject).lean();
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
        let resultObject = await shopModel.findOne(filterObject).lean()
            .populate({ path: "seller", select: "userName image type tier tierDuration isSubscribed subscriptionStartDate subscriptionEndDate fcmToken" })
            .populate({ path: "categories", select: "nameEn nameAr image subCategories" })
            .populate({ path: "productCategories", select: "nameEn nameAr image subCategories" })
            .populate({ path: "serviceCategories", select: "nameEn nameAr image subCategories" })
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
        let resultArray = await shopModel.find(filterObject).lean()
            .populate({ path: "seller", select: "userName image type tier tierDuration isSubscribed subscriptionStartDate subscriptionEndDate" })
            .populate({ path: "categories", select: "nameEn nameAr image subCategories" })
            .populate({ path: "productCategories", select: "nameEn nameAr image subCategories" })
            .populate({ path: "serviceCategories", select: "nameEn nameAr image subCategories" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let count = await shopModel.count(filterObject);
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
        const count = await shopModel.count(filterObject);
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


exports.listFeatured = async (filterObject) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, {})
        filterObject = normalizedQueryObjects.filterObject

        // console.log("filterObject", filterObject)
        let resultArray = await shopModel.aggregate([
            { $match: filterObject },
            {
                $lookup: {
                    from: 'sellers',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: '$seller' },
            { $match: { 'seller.isSubscribed': true } },
            {
                $addFields: {
                    tierOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$seller.tier', 'advanced'] }, then: 0 },
                                { case: { $eq: ['$seller.tier', 'lifetime'] }, then: 1 },
                                { case: { $eq: ['$seller.tier', 'pro'] }, then: 2 },
                                { case: { $eq: ['$seller.tier', 'basic'] }, then: 3 }
                            ],
                            default: 4
                        }
                    }
                }
            },
            { $sort: { tierOrder: 1 } }
        ]);
        // console.log("resultArray", resultArray)
        if (!resultArray || resultArray.length === 0) return {
            success: true,
            code: 200,
            result: [],
            count: 0
        }

        let finalResult = resultArray.slice(0, 10); // Take at most 10 shops

        finalResult.forEach((shopObject) => {
            shopObject.seller = {
                tier: shopObject.seller.tier,
                tierDuration: shopObject.seller.tierDuration,
                type: shopObject.seller.type,
            }
            delete shopObject.shopLicense
            delete shopObject.location
            delete shopObject.address
            delete shopObject.tierOrder
            delete shopObject.verifyDate
            delete shopObject.joinDate
        })

        // Shuffle the array
        for (let i = finalResult.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalResult[i], finalResult[j]] = [finalResult[j], finalResult[i]];
        }

        return {
            success: true,
            code: 200,
            result: finalResult,
            count: finalResult.length
        };

    } catch (err) {
        console.error(`Error in listFeatured: ${err.message}`);
        console.error(err.stack);
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
        const uniqueObjectResult = await this.isObjectUnique(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult
        const sellerObject = await sellerRepo.find({ _id: formObject.seller })
        formObject.type = sellerObject.result?.type
        const resultObject = new shopModel(formObject);
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
        formObject = this.convertToLowerCase(formObject)
        let existingObject = await this.find(filterObject)
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }


        if (formObject.nameEn || formObject.nameAr) {
            formObject.nameEn = formObject.nameEn ? formObject.nameEn : existingObject.result.nameEn;
            formObject.nameAr = formObject.nameAr ? formObject.nameAr : existingObject.result.nameAr;
            const uniqueObjectResult = await this.isNameUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        let resultObject = await shopModel.findByIdAndUpdate({ _id: filterObject._id }, formObject, { new: true })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
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


exports.updateDirectly = async (_id, formObject) => {
    try {
        let resultObject = await shopModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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
        const resultObject = await shopModel.updateMany(filterObject, formObject)
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


exports.updateManyById = async (arrayOfIds, formObject) => {
    try {
        const objectIds = arrayOfIds.map(id => mongoose.Types.ObjectId(id));
        await shopModel.updateMany({ _id: { $in: objectIds } }, formObject);
        return {
            success: true,
            code: 200
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
        const existingArray = await shopModel.find(filterObject);
        const resultObject = await shopModel.updateMany(filterObject, { isDeleted: true })
        existingArray.forEach(async (shop) => {
            productRepo.removeMany({ shop: shop._id });
            serviceRepo.removeMany({ shop: shop._id });
            couponRepo.removeMany({ shop: shop._id });
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
        let existingObject = await this.find(filterObject)
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let resultObject = await shopModel.findByIdAndUpdate({ _id: filterObject._id }, { isDeleted: true })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        productRepo.removeMany({ shop: filterObject._id });
        serviceRepo.removeMany({ shop: filterObject._id });
        couponRepo.removeMany({ shop: filterObject._id });

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


exports.updateBlockState = async (filterObject, newState) => {
    try {
        const existingArray = await shopModel.find(filterObject);
        const resultObject = await shopModel.updateMany(filterObject, { isActive: newState })
        existingArray.forEach(async (shop) => {
            productRepo.updateBlockState({ shop: shop._id }, newState);
            serviceRepo.updateMany({ shop: shop._id }, { isActive: newState });
            couponRepo.removeMany({ shop: shop._id }, newState);
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


exports.isObjectUnique = async (formObject) => {
    const duplicateObject = await this.find({
        seller: formObject.seller,
        isDeleted: false
    })

    if (duplicateObject.success) return {
        success: false,
        code: 409,
        error: i18n.__("shopExists")
    }


    return {
        success: true,
        code: 200
    }
}


exports.isNameUnique = async (formObject, existingObject) => {

    const duplicateObject = await this.find({
        seller: formObject.seller,
        isDeleted: false,
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
