const i18n = require('i18n');
const couponModel = require("./coupon.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const cartRepo = require("../Cart/cart.repo")
const basketRepo = require("../Basket/basket.repo")
const { isIdInArray } = require("../../helpers/cart.helper")

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

exports.removeMany = async (filterObject) => {
    try {
        const resultObject = await couponModel.updateMany(filterObject, { isActive: false })
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


exports.apply = async (cartId, couponId, shopId) => {
    try {
        let cartObject = await cartRepo.find({ _id: cartId })
        if (!cartObject.success || cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("hasCoupon") }
        if (cartObject.result.subCarts.length < 1) return { success: false, code: 409, error: i18n.__("emptyCart") }

        let couponObject = await this.find({ _id: couponId })
        let couponValidationResult = this.validateCoupon(couponObject.result)
        if (!couponValidationResult.success) return couponValidationResult;

        let couponShopId = shopId || couponObject?.result?.shop?.toString()
        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("couponNotValid") }
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let customerId = (cartObject.result.customer).toString()
        let didCustomerUseCoupon = isIdInArray(couponObject.result.usedBy, "customer", customerId)
        if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("usedCoupon") }

        let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "apply")

        subCartObject.shopTotal = calculatedTotals.newShopTotal
        subCartObject.coupon = couponId
        if (!couponObject?.result?.shop) subCartObject.couponShop = shopId

        cartObject.result.subCarts[isShopInCart?.result] = subCartObject
        let updatedCartResult = await cartRepo.updateDirectly(cartId, { subCarts: cartObject.result.subCarts, cartTotal: calculatedTotals.newCartTotal, coupon: couponId })

        this.updateDirectly(couponId, { $inc: { quantity: -1 }, $addToSet: { usedBy: { customer: customerId } } })
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


exports.cancel = async (cartId, shopId) => {
    try {
        let cartObject = await cartRepo.get({ _id: cartId })
        if (!cartObject?.success || !cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("notFound") }

        let customerId = (cartObject.result.customer._id).toString()
        let couponShopId = shopId || cartObject?.result?.coupon?.shop?.toString()


        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("notFound") }
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let couponObject = {};
        couponObject.result = { ...cartObject?.result?.coupon }

        let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "cancel")

        let newShopTotal = parseFloat(calculatedTotals.newShopTotal)

        let newCartTotal = parseFloat(calculatedTotals.newCartTotal)

        let updatedCartResult = await cartRepo.updateWithFilter({ _id: cartId, 'subCarts.shop': couponShopId }, {
            $set: { [`subCarts.${isShopInCart.result}.shopTotal`]: newShopTotal, cartTotal: newCartTotal },
            $unset: { [`subCarts.${isShopInCart.result}.coupon`]: 1, coupon: 1 }
        })

        this.updateDirectly((cartObject.result.coupon._id).toString(), { $inc: { quantity: 1 }, $pull: { usedBy: { customer: customerId } } })
        // console.log("updatedCartResult", updatedCartResult)
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


exports.applyOnBasket = async (basketId, couponId, shopId) => {
    try {
        let cartObject = await basketRepo.find({ _id: basketId })
        if (!cartObject.success || cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("hasCoupon") }
        if (cartObject.result.subCarts.length < 1) return { success: false, code: 409, error: i18n.__("emptyCart") }

        let couponObject = await this.find({ _id: couponId })
        let couponValidationResult = this.validateCoupon(couponObject.result)
        if (!couponValidationResult.success) return couponValidationResult;

        let couponShopId = shopId || couponObject?.result?.shop?.toString()
        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("couponNotValid") }
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let customerId = (cartObject.result.customer).toString()
        let didCustomerUseCoupon = isIdInArray(couponObject.result.usedBy, "customer", customerId)
        if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("usedCoupon") }

        let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "apply")

        subCartObject.shopTotal = calculatedTotals.newShopTotal
        subCartObject.coupon = couponId
        if (!couponObject?.result?.shop) subCartObject.couponShop = shopId

        cartObject.result.subCarts[isShopInCart?.result] = subCartObject
        let updatedCartResult = await basketRepo.updateDirectly(basketId, { subCarts: cartObject.result.subCarts, cartTotal: calculatedTotals.newCartTotal, coupon: couponId })

        this.updateDirectly(couponId, { $inc: { quantity: -1 }, $addToSet: { usedBy: { customer: customerId } } })
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


exports.cancelFromBasket = async (basketId) => {
    try {
        let cartObject = await basketRepo.get({ _id: basketId })
        if (!cartObject?.success || !cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("notFound") }

        let customerId = (cartObject.result.customer._id).toString()
        let couponShopId = shopId || cartObject?.result?.coupon?.shop?.toString()


        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("notFound") }
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let couponObject = {};
        couponObject.result = { ...cartObject?.result?.coupon }

        let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "cancel")

        let newShopTotal = parseFloat(calculatedTotals.newShopTotal)

        let newCartTotal = parseFloat(calculatedTotals.newCartTotal)

        let updatedCartResult = await basketRepo.updateWithFilter({ _id: basketId, 'subCarts.shop': couponShopId }, {
            $set: { [`subCarts.${isShopInCart.result}.shopTotal`]: newShopTotal, cartTotal: newCartTotal },
            $unset: { [`subCarts.${isShopInCart.result}.coupon`]: 1, coupon: 1 }
        })

        this.updateDirectly((cartObject.result.coupon._id).toString(), { $inc: { quantity: 1 }, $pull: { usedBy: { customer: customerId } } })
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


exports.calculateNewTotal = (couponObject, cartObject, subCartObject, operationType) => {
    let newShopTotal = 0
    let newCartTotal = 0

    if (!operationType || operationType == "apply") {
        if (couponObject.result.discountType == "value") {
            newShopTotal = parseFloat(subCartObject.shopTotal) - parseFloat(couponObject.result.value)
            newCartTotal = parseFloat(cartObject.result.cartTotal) - parseFloat(couponObject.result.value)
        }

        if (couponObject.result.discountType == "percentage") {
            newShopTotal = parseFloat(subCartObject.shopTotal) - (parseFloat(couponObject.result.percentage) * parseFloat(subCartObject.shopTotal))
            newCartTotal = parseFloat(cartObject.result.cartTotal) - (parseFloat(couponObject.result.percentage) * parseFloat(subCartObject.shopTotal))
        }
    }

    if (operationType == "cancel") {
        console.log("Cancel Coupon")

        if (couponObject.result.discountType == "value") {

            newShopTotal = parseFloat(subCartObject.shopTotal) + parseFloat(couponObject.result.value)
            newCartTotal = parseFloat(cartObject.result.cartTotal) + parseFloat(couponObject.result.value)

        }

        if (couponObject.result.discountType == "percentage") {
            newShopTotal = parseFloat(subCartObject.shopTotal) + (parseFloat(couponObject.result.percentage) * parseFloat(subCartObject.shopOriginalTotal))
            newCartTotal = parseFloat(cartObject.result.cartTotal) + (parseFloat(couponObject.result.percentage) * parseFloat(subCartObject.shopOriginalTotal))
        }
    }

    if (newShopTotal < 0) newShopTotal = 0;
    if (newCartTotal < 0) newCartTotal = 0;


    return { newShopTotal, newCartTotal }
}


exports.applyOnSubscriptionFees = async (couponId, sellerId, subscriptionFees) => {
    try {
        console.log("applying coupon on subscription fees...")
        let couponObject = await this.find({ _id: couponId })
        let couponValidationResult = this.validateCoupon(couponObject.result)
        if (!couponValidationResult.success) return couponValidationResult;

        // let didCustomerUseCoupon = isIdInArray(couponObject.result.usedBy, "seller", sellerId)
        // if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("usedCoupon") }

        let newSubscriptionFees = this.calculateNewSubscriptionFees(couponObject, subscriptionFees)
        console.log("newSubscriptionFees", newSubscriptionFees)

        this.updateDirectly(couponId, { $inc: { quantity: -1 }, $addToSet: { usedBy: { seller: sellerId } } })
        return {
            success: true,
            result: newSubscriptionFees,
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


exports.calculateNewSubscriptionFees = (couponObject, subscriptionFees) => {
    let newSubscriptionFees = 0

    if (couponObject.result.discountType == "value")
        newSubscriptionFees = parseFloat(subscriptionFees) - parseFloat(couponObject.result.value)

    if (couponObject.result.discountType == "percentage")
        newSubscriptionFees = parseFloat(subscriptionFees) - (parseFloat(couponObject.result.percentage) * parseFloat(subscriptionFees))

    if (newSubscriptionFees < 0) newSubscriptionFees = 0;

    return newSubscriptionFees
}


exports.validateCoupon = (couponObject) => {
    if (!couponObject.isActive) return { success: false, code: 409, error: i18n.__("invalidCoupon") }
    if (couponObject.quantity < 1) return { success: false, code: 409, error: i18n.__("invalidCoupon") }
    let todayDate = new Date(Date.now())
    if (couponObject.expirationDate < todayDate) return { success: false, code: 409, error: i18n.__("invalidCoupon") }

    return { success: true }
}