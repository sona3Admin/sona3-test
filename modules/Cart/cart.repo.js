let cartModel = require("./cart.model");
let variationRepo = require("../Variation/variation.repo")
const i18n = require('i18n');
const { isStockAvailable, isIdInArray, removeItemFromItemsArray, removeShopFromSubCartsArray, decreaseItemQuantity,
    addNewSubCart, updateExistingSubCart, calculateCartTotal } = require("../../helpers/cart.helper")


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
        let resultObject = await cartModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({
                path: "subCarts",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "items.product", select: "nameEn nameAr" },
                    { path: "items.variation", select: "stock packages minPackage descriptionEn descriptionAr images fields" }
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
        const resultArray = await cartModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({
                path: "subCarts",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "items.product", select: "nameEn nameAr" },
                    { path: "items.variation", select: "stock packages minPackage descriptionEn descriptionAr images fields" }
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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.addItemToList = async (customerId, itemId, quantityToAdd) => {
    try {
        let variationResultObject = await variationRepo.find({ _id: itemId });
        if (!variationResultObject?.success) return { success: false, code: 404, error: i18n.__("notFound") }

        let itemObject = variationResultObject.result;

        let currentStock = parseInt(itemObject.stock)
        if (!isStockAvailable(currentStock, quantityToAdd)) return { success: false, code: 409, error: i18n.__("outOfStock") }

        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;
        let cartObject = cartResultObject.result;

        let isShopInSubCarts = isIdInArray(cartObject.subCarts, "shop", itemObject.shop)

        if (isShopInSubCarts.success) updateExistingSubCart(cartObject, isShopInSubCarts?.result, itemObject, itemId, parseInt(quantityToAdd))

        if (!isShopInSubCarts.success) addNewSubCart(cartObject, itemObject, parseInt(quantityToAdd))

        cartObject = calculateCartTotal(cartObject);

        let updatedStock = currentStock - parseInt(quantityToAdd);
        variationRepo.updateDirectly(itemId, { stock: updatedStock });
        let updatedCartResult = await this.updateDirectly(cartObject._id, cartObject);

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
};


exports.removeItemFromList = async (customerId, shopId, itemId, quantityToRemove) => {
    try {
        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;
        let cartObject = cartResultObject.result;

        let isShopInSubCarts = isIdInArray(cartObject.subCarts, "shop", shopId)
        if (!isShopInSubCarts || !isShopInSubCarts.success) return { success: false, code: 404, error: i18n.__("notFound") };
        let shopCartIndex = parseInt(isShopInSubCarts.result)
        let shopCartObject = cartObject.subCarts[shopCartIndex]
        
        let isItemInShopCart = isIdInArray(shopCartObject.items, "variation", itemId);
        if (!isItemInShopCart || !isItemInShopCart.success) return { success: false, code: 404, error: i18n.__("notFound") };
        let itemIndex = parseInt(isItemInShopCart.result);
        let itemObject = shopCartObject.items[itemIndex];
        quantityToRemove = parseInt(quantityToRemove)

        if (parseInt(quantityToRemove) >= itemObject.quantity) shopCartObject.items = removeItemFromItemsArray(shopCartObject, itemIndex);
        if (shopCartObject.items.length <= 0) cartObject.subCarts = removeShopFromSubCartsArray(cartObject.subCarts, shopCartIndex);
        if (parseInt(quantityToRemove) < parseInt(itemObject.quantity))
            shopCartObject.items = decreaseItemQuantity(shopCartObject, shopCartObject.items, parseInt(itemIndex), parseInt(quantityToRemove), itemObject.variation);

        cartObject = calculateCartTotal(cartObject);

        let updatedStock = parseInt(itemObject.variation.stock) + parseInt(quantityToRemove);
        variationRepo.updateDirectly(itemId, { stock: updatedStock });

        let updatedCartResult = await this.updateDirectly(cartObject._id, cartObject);

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
};


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
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
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
        let formObject = { subCarts: [], cartTotal: 0, cartOriginalTotal: 0, $unset: { coupon: 1 } }
        resultObject = await cartModel.findByIdAndUpdate({ _id: resultObject.result._id }, formObject, { new: true })

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

