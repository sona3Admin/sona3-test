const i18n = require('i18n');
const couponModel = require("./coupon.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const cartRepo = require("../Cart/cart.repo")
const { isIdInArray, updateExistingSubCart, calculateCartTotal } = require("../../helpers/cart.helper")

exports.find = async (filterObject) => {
    try {
        const resultObject = await couponModel.findOne(filterObject).lean();
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
        const resultObject = await couponModel.findOne(filterObject).lean()
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .populate({ path: "usedBy.customer", select: "name image" })
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
        const resultArray = await couponModel.find(filterObject).lean()
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .populate({ path: "usedBy.customer", select: "name image" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await couponModel.count(filterObject);
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
        const resultObject = new couponModel(formObject);
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


exports.update = async (_id, formObject) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await couponModel.findByIdAndUpdate({ _id }, formObject, { new: true });

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
        const resultObject = await couponModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await couponModel.findByIdAndUpdate({ _id }, { isActive: false });

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


exports.apply = async (cartId, couponId) => {
    let cartObject = await cartRepo.find({ _id: cartId })
    if (!cartObject.success || cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("") }
    if (cartObject.result.subCarts.length < 1) return { success: false, code: 409, error: i18n.__("") }

    let couponObject = await this.find({ _id: couponId })
    let couponValidationResult = this.validateCoupon(couponObject.result)
    if (!couponValidationResult.success) return couponValidationResult;

    let couponShopId = couponObject.result.shop
    let isShopInCart = isIdInArray(cartObject.subCarts, "shop", couponShopId)
    if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("") }
    let subCartObject = cartObject.subCarts[isShopInCart?.result]

    let customerId = cartObject.result.customer
    let didCustomerUseCoupon = isIdInArray(couponObject.usedBy, "customer", customerId)
    if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("") }

    let newShopTotal = parseFloat(subCartObject.shopTotal) - parseFloat(couponObject.value)
    if (newShopTotal < 0) newShopTotal = 0;
    subCartObject.shopTotal = newShopTotal
    subCartObject.coupon = couponId
    cartObject.subCarts[isShopInCart?.result] = subCartObject

    let newCartTotal = parseFloat(cartObject.result.cartTotal) - newShopTotal
    let updatedCartResult = await cartRepo.updateDirectly(cartId, { subCarts: cartObject.subCarts, cartTotal: newCartTotal, coupon: couponId })

    this.updateDirectly(couponId, { $inc: { quantity: -1 }, $addToSet: { usedBy: customerId } })
    return {
        success: true,
        result: updatedCartResult.result,
        code: 201
    };
}


exports.validateCoupon = (couponObject) => {
    if (!couponObject.isActive) return { success: false, code: 409, error: i18n.__("") }
    if (couponObject.quantity < 1) return { success: false, code: 409, error: i18n.__("") }
    let todayDate = new Date(Date.now())
    if (couponObject.expirationDate < todayDate) return { success: false, code: 409, error: i18n.__("") }

    return { success: true }
}