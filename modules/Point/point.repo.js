const i18n = require('i18n');
const pointModel = require("./point.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { getSettings } = require("../../helpers/settings.helper")
const cartRepo = require("../Cart/cart.repo")


exports.find = async (filterObject) => {
    try {
        const resultObject = await pointModel.findOne(filterObject).lean();
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
        const resultObject = await pointModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({ path: "shop", select: "nameEn nameAr image" })
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
        const resultArray = await pointModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await pointModel.count(filterObject);
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


exports.create = async (formObject) => {
    try {
        const resultObject = new pointModel(formObject);
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


exports.writeMany = async (arrayOfPoints, customerId) => {
    try {
        const bulkOperations = arrayOfPoints.map((pointObject) => ({
            updateOne: {
                filter: { customer: customerId, shop: pointObject.shop },
                update: {
                    $set: { customer: customerId, shop: pointObject.shop },
                    $inc: { currentPoints: pointObject.shopOriginalTotal }
                },
                upsert: true
            }
        }));

        const resultArray = await pointModel.bulkWrite(bulkOperations)
        return {
            success: true,
            code: 201,
            result: resultArray
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

        const resultObject = await pointModel.findByIdAndUpdate({ _id }, formObject, { new: true });

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
        const resultObject = await pointModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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


exports.remove = async (_id) => {
    try {
        const resultObject = await pointModel.findByIdAndDelete({ _id })

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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.apply = async (customerId, shopId, pointsToApply) => {
    try {
        let cartObject = await cartRepo.find({ customer: customerId })
        if (!cartObject.success || cartObject.result.subCarts.length < 1) return { success: false, code: 409, error: i18n.__("emptyCart") }

        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", shopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("notFound") }
        console.log("subCart index", isShopInCart?.result);
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let pointObject = await this.find({ customer: customerId, shop: shopId })
        let currentPoints = parseInt(pointObject.result.currentPoints)
        if (!pointObject.success || currentPoints < 1) return { success: false, code: 409, error: i18n.__("noPoints") }
        if (currentPoints <= pointsToApply) pointsToApply = currentPoints;

        let pointsValue = await getSettings('pointsToCash')
        let discountValue = pointsToApply / parseFloat(pointsValue)

        let newShopTotal = parseInt(subCartObject.shopTotal) - discountValue
        console.log("newShopTotal", newShopTotal);

        let newCartTotal = parseInt(cartObject.result.cartTotal) - discountValue
        console.log("newCartTotal", newCartTotal);

        let updatedCartResult = await cartRepo.updateWithFilter({ customer: customerId, 'subCarts.shop': shopId }, {
            $set: {
                [`subCarts.${isShopInCart.result}.shopTotal`]: newShopTotal,
                [`subCarts.${isShopInCart.result}.usedLoyaltyPoints`]: { usedPoints: pointsToApply, pointsValue, discountValue },
                cartTotal: newCartTotal,
            },
            $push: { usedLoyaltyPoints: { shop: shopId, usedPoints: pointsToApply, pointsValue, discountValue } }
        })

        let pointId = (pointObject.result._id).toString()
        this.updateDirectly(pointId, { $inc: { currentPoints: -pointsToApply, usedPoints: pointsToApply } })

        return {
            success: true,
            result: updatedCartResult.result,
            code: 201
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