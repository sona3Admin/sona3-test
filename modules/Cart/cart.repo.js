let cartModel = require("./cart.model");
let variationRepo = require("../Variation/variation.repo")
let customerRepo = require("../Customer/customer.repo")
const productRepo = require("../Product/product.repo")
const i18n = require('i18n');
const { isStockAvailable, isIdInArray, removeItemFromItemsArray, removeShopFromSubCartsArray, decreaseItemQuantity,
    addNewSubCart, updateExistingSubCart, calculateCartTotal } = require("../../helpers/cart.helper")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");
const couponRepo = require("../Coupon/coupon.repo")


exports.find = async (filterObject) => {
    try {
        const resultObject = await cartModel.findOne(filterObject).lean();
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
        let resultObject = await cartModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name email phone image loyaltyPoints cashback hasPurchased birthDate" })
            .populate({ path: "coupon", select: "nameEn nameAr code discountType value percentage shop" })
            .populate({
                path: "subCarts",
                populate: [
                    { path: "shop", select: "nameEn nameAr phone image seller location address" },
                    { path: "coupon", select: "nameEn nameAr code discountType value percentage shop" },
                    { path: "items.product", select: "nameEn nameAr categories isActive" },
                    { path: "items.variation", select: "stock packages minPackage defaultPackage descriptionEn descriptionAr images fields  width height length weight" }
                ]
            })
            .select(selectionObject)


        if (!resultObject)
            resultObject = await cartModel.findOneAndUpdate(filterObject,
                { $setOnInsert: { customer: filterObject.customer } },
                { upsert: true, new: true }
            ).lean();

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
        const resultArray = await cartModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({ path: "coupon", select: "nameEn nameAr code discountType value percentage shop" })
            .populate({
                path: "subCarts",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "coupon", select: "nameEn nameAr code discountType value percentage shop" },
                    { path: "items.product", select: "nameEn nameAr isActive" },
                    { path: "items.variation", select: "stock packages minPackage defaultPackage descriptionEn descriptionAr images fields" }
                ]
            })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await cartModel.count(filterObject);
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


exports.count = async (filterObject, sortObject) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        const count = await cartModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: count
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


exports.addItemToList = async (customerId, itemId, quantityToAdd) => {
    try {
        logInTestEnv("itemId", itemId);
        let variationResultObject = await variationRepo.get({ _id: itemId });
        if (!variationResultObject?.success) return { success: false, code: 404, error: i18n.__("notFound") }
        if (variationResultObject.result.product.isFood) return { success: false, code: 404, error: i18n.__("isNotFoodCart") }

        variationResultObject.result.seller = variationResultObject.result.seller._id
        variationResultObject.result.shop = variationResultObject.result.shop._id
        variationResultObject.result.product = variationResultObject.result.product._id

        let itemObject = variationResultObject.result;
        logInTestEnv("itemObject", itemObject._id);

        let currentStock = parseInt(itemObject.stock)
        if (!isStockAvailable(currentStock, quantityToAdd)) return { success: false, code: 409, error: i18n.__("outOfStock") }

        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;
        let cartObject = cartResultObject.result;

        let isShopInSubCarts = isIdInArray(cartObject.subCarts, "shop", itemObject.shop)

        if (isShopInSubCarts.success) updateExistingSubCart(cartObject, isShopInSubCarts?.result, itemObject, itemId, parseInt(quantityToAdd))

        if (!isShopInSubCarts.success) addNewSubCart(cartObject, itemObject, parseInt(quantityToAdd))
        delete cartObject.variations;
        cartObject.$addToSet = { variations: itemId }
        cartObject = calculateCartTotal(cartObject);

        let updatedStock = currentStock - parseInt(quantityToAdd);
        variationRepo.updateDirectly(itemId, { stock: updatedStock, $inc: { rank: 1 } });
        let updatedCartResult = await this.updateDirectly(cartObject._id, cartObject);
        productRepo.updateDirectly(variationResultObject.result.product, { $inc: { stock: -parseInt(quantityToAdd) } });

        return {
            success: true,
            result: updatedCartResult.result,
            newStock: updatedStock,
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
};


exports.removeItemFromList = async (customerId, shopId, itemId, quantityToRemove) => {
    try {
        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;
        let cartObject = cartResultObject.result;
        logInTestEnv(cartObject);
        let isShopInSubCarts = isIdInArray(cartObject.subCarts, "shop", shopId)
        if (!isShopInSubCarts || !isShopInSubCarts.success) return { success: false, code: 404, error: i18n.__("notFound") };
        let shopCartIndex = parseInt(isShopInSubCarts.result)
        let shopCartObject = cartObject.subCarts[shopCartIndex]

        let isItemInShopCart = isIdInArray(shopCartObject.items, "variation", itemId);
        if (!isItemInShopCart || !isItemInShopCart.success) return { success: false, code: 404, error: i18n.__("notFound") };
        let itemIndex = parseInt(isItemInShopCart.result);
        let itemObject = shopCartObject.items[itemIndex];
        quantityToRemove = parseInt(quantityToRemove)

        if (parseInt(quantityToRemove) >= itemObject.quantity) {
            shopCartObject.items = removeItemFromItemsArray(shopCartObject, itemIndex);
            delete cartObject.variations;
            cartObject.$pull = { variations: itemId }
        }
        if (shopCartObject.items.length <= 0) {
            if (shopCartObject.coupon){
                couponRepo.updateDirectly((shopCartObject.coupon._id).toString(), { $inc: { quantity: 1 }, $pull: { usedBy: { customer: cartObject.customer._id } } })
            }
            cartObject.subCarts = removeShopFromSubCartsArray(cartObject.subCarts, shopCartIndex);
            
        }
        if (parseInt(quantityToRemove) < parseInt(itemObject.quantity))
            shopCartObject.items = decreaseItemQuantity(shopCartObject, shopCartObject.items, parseInt(itemIndex), parseInt(quantityToRemove), itemObject.variation);

        cartObject = calculateCartTotal(cartObject);

        let updatedStock = parseInt(itemObject.variation.stock) + parseInt(quantityToRemove);
        variationRepo.updateDirectly(itemId, { stock: updatedStock });
        productRepo.updateDirectly(itemObject.product._id, { $inc: { stock: parseInt(quantityToRemove) } });

        let updatedCartResult = await this.updateDirectly(cartObject._id, cartObject);

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
};


exports.updateWithFilter = async (filterObject, formObject) => {
    try {
        const resultObject = await cartModel.findOneAndUpdate(filterObject, formObject, { new: true })
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


exports.updateDirectly = async (_id, formObject) => {
    try {
        const resultObject = await cartModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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


exports.updateManyCarts = async (shopId, itemId) => {
    try {
        const existingArray = await cartModel.find({ variations: itemId });
        existingArray.forEach(async (cart) => {
            let isShopInSubCarts = isIdInArray(cart.subCarts, "shop", shopId)
            let shopCartIndex = parseInt(isShopInSubCarts.result)
            let shopCartObject = cart.subCarts[shopCartIndex]
            let isItemInShopCart = isIdInArray(shopCartObject.items, "variation", itemId);
            let itemIndex = parseInt(isItemInShopCart.result);
            let itemObject = shopCartObject.items[itemIndex];
            let cartTotal = cart.cartTotal - itemObject.itemTotal
            let cartOriginalTotal = cart.cartOriginalTotal - itemObject.itemTotal

            cart.subCarts[shopCartIndex].items.splice(itemIndex, 1);
            if (cart.subCarts[shopCartIndex].items.length <= 0) {
                cart.subCarts.splice(shopCartIndex, 1)
            } else {
                let shopTotal = shopCartObject.shopTotal - itemObject.itemTotal
                cart.subCarts[shopCartIndex].shopTotal = shopTotal
            }
            cart.cartTotal = cartTotal
            cart.cartOriginalTotal = cartOriginalTotal
            cart.variations.pull(itemId);
            this.updateDirectly(cart._id, cart);
        });
        return {
            success: true,
            code: 200
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
        const resultObject = await cartModel.findByIdAndDelete({ _id })

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


exports.reset = async (filterObject) => {
    try {
        let resultObject = await this.find(filterObject)
        if (!resultObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }
        await resultObject.result.subCarts.forEach(subCart => {
            subCart.items.forEach(item => {
                variationRepo.updateDirectly(item.variation, { $inc: { stock: parseInt(item.quantity) } });
                productRepo.updateDirectly(item.product, { $inc: { stock: parseInt(item.quantity) } });
            })
        });
        if (resultObject.result.coupon) {
            couponRepo.updateDirectly((resultObject.result.coupon).toString(), { $inc: { quantity: 1 }, $pull: { usedBy: { customer: resultObject.result.customer } } })
        }
        let formObject = { variations: [], subCarts: [], cartTotal: 0, cartOriginalTotal: 0, usedCashback: 0, $unset: { coupon: 1, couponShop: 1 } }
        resultObject = await cartModel.findByIdAndUpdate({ _id: resultObject.result._id }, formObject, { new: true })

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


exports.flush = async (filterObject) => {
    try {
        let resultObject = await this.find(filterObject)
        if (!resultObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }
        let formObject = { variations: [], subCarts: [], cartTotal: 0, cartOriginalTotal: 0, usedCashback: 0, $unset: { coupon: 1, couponShop: 1 } }
        resultObject = await cartModel.findByIdAndUpdate({ _id: resultObject.result._id }, formObject, { new: true })

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


exports.useCashback = async (customerId, shopId, cashbackToUse) => {
    try {
        cashbackToUse = parseFloat(cashbackToUse)
        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;

        const currentCustomerCashback = parseInt(cartResultObject?.result?.customer?.cashback)
        if (cashbackToUse > currentCustomerCashback)
            return { success: false, code: 409, error: i18n.__("noPoints") }

        let isShopInSubCarts = isIdInArray(cartResultObject.result.subCarts, "shop", shopId)
        if (!isShopInSubCarts || !isShopInSubCarts.success) return { success: false, code: 404, error: i18n.__("notFound") };
        let shopCartIndex = parseInt(isShopInSubCarts.result)
        let shopCartObject = cartResultObject.result.subCarts[shopCartIndex]

        if (!cartResultObject.result.usedCashback) cartResultObject.result.usedCashback = 0
        shopCartObject.usedCashback += parseFloat(cashbackToUse)
        shopCartObject.shopTotal -= parseFloat(cashbackToUse)
        cartResultObject.result.cartTotal -= parseFloat(cashbackToUse)
        cartResultObject.result.usedCashback += parseFloat(cashbackToUse)

        if (shopCartObject.shopTotal < 0) shopCartObject.shopTotal = 0
        if (cartResultObject.result.cartTotal < 0) cartResultObject.result.cartTotal = 0

        let updatedCartResult = await this.updateDirectly(cartResultObject.result._id, {
            subCarts: cartResultObject.result.subCarts,
            cartTotal: cartResultObject.result.cartTotal,
            usedCashback: cartResultObject.result.usedCashback
        });

        customerRepo.updateDirectly(cartResultObject?.result?.customer?._id.toString(), { $inc: { cashback: -cashbackToUse } })
        return updatedCartResult

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }
}


exports.redeemCashback = async (customerId, cashbackToRedeem) => {
    try {
        cashbackToRedeem = parseInt(cashbackToRedeem)
        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;

        const usedCashback = parseInt(cartResultObject?.result?.usedCashback)
        if (cashbackToRedeem > usedCashback)
            return { success: false, code: 409, error: i18n.__("noPoints") }

        let updatedCartResult = await this.updateDirectly(cartResultObject.result._id, { $inc: { usedCashback: -cashbackToRedeem } });
        customerRepo.updateDirectly(cartResultObject?.result?.customer?._id.toString(), { $inc: { cashback: cashbackToRedeem } })
        return updatedCartResult

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }
}