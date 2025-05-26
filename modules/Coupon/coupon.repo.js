const i18n = require('i18n');
const couponModel = require("./coupon.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const cartRepo = require("../Cart/cart.repo")
const basketRepo = require("../Basket/basket.repo")
const { isIdInArray, findObjectInArray } = require("../../helpers/cart.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");
const cartHelper = require("../../helpers/cart.helper")

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
        const resultObject = await couponModel.findOne(filterObject).lean()
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .populate({ path: "usedBy.customer", select: "name image" })
            .populate({ path: "usedBy.seller", select: "userName image" })
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
        const resultArray = await couponModel.find(filterObject).lean()
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .populate({ path: "usedBy.customer", select: "name image" })
            .populate({ path: "usedBy.seller", select: "userName image" })
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

        const uniqueObjectResult = await this.isObjectUnique(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult

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
        logInTestEnv(`err.message`, err.message);
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
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.applyOnCart = async (cartId, couponId, shopId) => {
    try {
        let cartObject = await cartRepo.find({ _id: cartId })
        if (!cartObject.success || cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("hasCoupon") }
        if (cartObject.result.subCarts.length < 1) return { success: false, code: 409, error: i18n.__("emptyCart") }

        let couponObject = await this.find({ code: couponId })
        if (!couponObject.success || couponObject.result.userType !== "customer") return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };
        let couponValidationResult = this.validateCoupon(couponObject.result)
        if (!couponValidationResult.success) return couponValidationResult;
        if (couponObject?.result?.shop && couponObject?.result?.shop.toString() !== shopId) return { success: false, code: 409, error: i18n.__("couponNotValid") }
        let couponShopId = shopId || couponObject?.result?.shop?.toString()
        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("couponNotValid") }
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let customerId = (cartObject.result.customer).toString()
        let didCustomerUseCoupon = findObjectInArray(couponObject.result.usedBy, "customer", customerId)
        if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("usedCoupon") }

        let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "apply")

        subCartObject.shopTotal = calculatedTotals.newShopTotal
        subCartObject.coupon = couponObject.result._id.toString()
        if (!couponObject?.result?.shop) subCartObject.couponShop = shopId

        cartObject.result.subCarts[isShopInCart?.result] = subCartObject
        let updatedCartResult = await cartRepo.updateDirectly(cartId, {
            subCarts: cartObject.result.subCarts,
            cartTotal: calculatedTotals.newCartTotal,
            coupon: couponObject.result._id.toString(),
            couponShop: shopId
        })
        this.updateDirectly(couponObject.result._id.toString(), { $inc: { quantity: -1 }, $addToSet: { usedBy: { customer: customerId } } })
        return {
            success: true,
            result: updatedCartResult.result,
            code: 201
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


exports.cancelFromCart = async (cartId, shopId) => {
    try {
        let cartObject = await cartRepo.get({ _id: cartId })
        if (!cartObject?.success || !cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("notFound") }

        let customerId = (cartObject.result.customer._id).toString()
        let couponShopId = shopId || cartObject?.result?.coupon?.shop?.toString()

        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("notFound") }
        // let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let couponObject = {};
        couponObject.result = { ...cartObject?.result?.coupon }
        cartObject.result.subCarts[isShopInCart?.result].coupon = null
        cartObject.result.subCarts[isShopInCart?.result] = await cartHelper.calculateShopTotal(cartObject.result.subCarts[isShopInCart?.result])
        cartObject.result.coupon = null
        cartObject.result.couponShop = null
        cartObject.result = await cartHelper.calculateCartTotal(cartObject.result)
        // let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "cancel")

        let newShopTotal = parseFloat(cartObject.result.subCarts[isShopInCart?.result].shopTotal)
        let newCartTotal = parseFloat(cartObject.result.cartTotal)

        let updatedCartResult = await cartRepo.updateWithFilter({ _id: cartId, 'subCarts.shop': couponShopId }, {
            $set: { [`subCarts.${isShopInCart.result}.shopTotal`]: newShopTotal, cartTotal: newCartTotal },
            $unset: { [`subCarts.${isShopInCart.result}.coupon`]: 1, coupon: 1, couponShop: 1 }
        })

        this.updateDirectly((couponObject.result._id).toString(), { $inc: { quantity: 1 }, $pull: { usedBy: { customer: customerId } } })
        return {
            success: true,
            result: updatedCartResult.result,
            code: 201
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


exports.applyOnBasket = async (cartId, couponId, shopId) => {
    try {
        let cartObject = await basketRepo.find({ _id: cartId })
        if (!cartObject.success || cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("hasCoupon") }
        if (cartObject.result.subCarts.length < 1) return { success: false, code: 409, error: i18n.__("emptyCart") }

        let couponObject = await this.find({ code: couponId })
        if (!couponObject.success || couponObject.result.userType !== "customer") return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };
        let couponValidationResult = this.validateCoupon(couponObject.result)
        if (!couponValidationResult.success) return couponValidationResult;
        if (couponObject?.result?.shop && couponObject?.result?.shop.toString() !== shopId) return { success: false, code: 409, error: i18n.__("couponNotValid") }

        let couponShopId = shopId || couponObject?.result?.shop?.toString()
        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("couponNotValid") }
        let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let customerId = (cartObject.result.customer).toString()
        let didCustomerUseCoupon = findObjectInArray(couponObject.result.usedBy, "customer", customerId)
        if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("usedCoupon") }

        let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "apply")

        subCartObject.shopTotal = calculatedTotals.newShopTotal
        subCartObject.coupon = couponObject.result._id.toString()
        if (!couponObject?.result?.shop) subCartObject.couponShop = shopId

        cartObject.result.subCarts[isShopInCart?.result] = subCartObject
        let updatedCartResult = await basketRepo.updateDirectly(cartId, {
            subCarts: cartObject.result.subCarts,
            cartTotal: calculatedTotals.newCartTotal,
            coupon: couponObject.result._id.toString(),
            couponShop: shopId
        })
        this.updateDirectly(couponObject.result._id.toString(), { $inc: { quantity: -1 }, $addToSet: { usedBy: { customer: customerId } } })
        return {
            success: true,
            result: updatedCartResult.result,
            code: 201
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


exports.cancelFromBasket = async (cartId, shopId) => {
    try {
        let cartObject = await basketRepo.get({ _id: cartId })
        if (!cartObject?.success || !cartObject?.result?.coupon) return { success: false, code: 409, error: i18n.__("notFound") }

        let customerId = (cartObject.result.customer._id).toString()
        let couponShopId = shopId || cartObject?.result?.coupon?.shop?.toString()


        let isShopInCart = isIdInArray(cartObject.result.subCarts, "shop", couponShopId)
        if (!isShopInCart.success) return { success: false, code: 409, error: i18n.__("notFound") }
        // let subCartObject = cartObject.result.subCarts[isShopInCart?.result]

        let couponObject = {};
        couponObject.result = { ...cartObject?.result?.coupon }
        cartObject.result.subCarts[isShopInCart?.result].coupon = null
        cartObject.result.subCarts[isShopInCart?.result] = await cartHelper.calculateShopTotal(cartObject.result.subCarts[isShopInCart?.result])
        cartObject.result.coupon = null
        cartObject.result.couponShop = null
        cartObject.result = await cartHelper.calculateCartTotal(cartObject.result)
        // let calculatedTotals = this.calculateNewTotal(couponObject, cartObject, subCartObject, "cancel")

        let newShopTotal = parseFloat(cartObject.result.subCarts[isShopInCart?.result].shopTotal)
        let newCartTotal = parseFloat(cartObject.result.cartTotal)

        let updatedCartResult = await basketRepo.updateWithFilter({ _id: cartId, 'subCarts.shop': couponShopId }, {
            $set: { [`subCarts.${isShopInCart.result}.shopTotal`]: newShopTotal, cartTotal: newCartTotal },
            $unset: { [`subCarts.${isShopInCart.result}.coupon`]: 1, coupon: 1, couponShop: 1 }
        })

        this.updateDirectly((couponObject.result._id).toString(), { $inc: { quantity: 1 }, $pull: { usedBy: { customer: customerId } } })
        // logInTestEnv("updatedCartResult", updatedCartResult)
        return {
            success: true,
            result: updatedCartResult.result,
            code: 201
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
        logInTestEnv("Cancel Coupon")

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


exports.applyOnSubscriptionFees = async (couponId, sellerId, subscriptionFees, initialFees) => {
    try {
        logInTestEnv("applying coupon on subscription fees...")
        let couponObject = await this.find({ code: couponId })
        if (!couponObject.success || couponObject.result.userType !== "seller") return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        let couponValidationResult = this.validateCoupon(couponObject.result)
        if (!couponValidationResult.success) return couponValidationResult;

        // let didCustomerUseCoupon = isIdInArray(couponObject.result.usedBy, "seller", sellerId)
        // if (didCustomerUseCoupon.success) return { success: false, code: 409, error: i18n.__("usedCoupon") }

        let newFees = this.calculateNewSubscriptionFees(couponObject, subscriptionFees, initialFees)
        logInTestEnv("newFees", newFees)

        this.updateDirectly(couponObject.result._id.toString(), { $inc: { quantity: -1 }, $addToSet: { usedBy: { seller: sellerId } } })
        return {
            success: true,
            result: newFees,
            code: 201
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


exports.calculateNewSubscriptionFees = (couponObject, subscriptionFees, initialFees) => {
    let newSubscriptionFees = 0
    let newInitialFees = initialFees
    if (couponObject.result.discountType == "value") {
        newSubscriptionFees = parseFloat(subscriptionFees) - parseFloat(couponObject.result.value)
        if (newSubscriptionFees < 0) newInitialFees += newSubscriptionFees
    }

    if (couponObject.result.discountType == "percentage") {
        newSubscriptionFees = parseFloat(subscriptionFees) - (parseFloat(couponObject.result.percentage) * parseFloat(subscriptionFees))
        newInitialFees = parseFloat(newInitialFees) - (parseFloat(couponObject.result.percentage) * parseFloat(newInitialFees))
    }


    if (newSubscriptionFees < 0) newSubscriptionFees = 0;
    if (newInitialFees < 0) newInitialFees = 0;

    return { newSubscriptionFees, newInitialFees }
}


exports.validateCoupon = (couponObject) => {
    if (!couponObject?.isActive) return { success: false, code: 409, error: i18n.__("invalidCoupon") }
    if (couponObject.quantity < 1) return { success: false, code: 409, error: i18n.__("invalidCoupon") }
    let todayDate = new Date(Date.now())
    if (couponObject?.expirationDate && couponObject?.expirationDate < todayDate) return { success: false, code: 409, error: i18n.__("invalidCoupon") }

    return { success: true }
}



exports.isObjectUnique = async (formObject) => {
    const duplicateObject = await this.find({
        code: formObject.code
    })

    if (duplicateObject.success) return {
        success: false,
        code: 409,
        error: i18n.__("nameUsed")
    }


    return {
        success: true,
        code: 200
    }
}