let cartModel = require("./cart.model");
let variationRepo = require("../Variation/variation.repo")
const i18n = require('i18n');
const mongoose = require("mongoose");


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
                path: "items",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "product", select: "nameEn nameAr" },
                    { path: "variation", select: "stock packages minPackage descriptionEn descriptionAr images fields" }
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
                path: "items",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "product", select: "nameEn nameAr" },
                    { path: "variation", select: "stock packages minPackage descriptionEn descriptionAr images fields" }
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
        // Fetch Variation
        let variationResultObject = await variationRepo.find({ _id: itemId });
        if (!variationResultObject?.success) return { success: false, code: 404, error: i18n.__("notFound") }

        let itemObject = variationResultObject.result;

        // Check Stock Availability
        let currentStock = itemObject.stock
        if (!isStockAvailable(currentStock, quantityToAdd)) return { success: false, code: 409, error: i18n.__("outOfStock") }


        // Get Customer Cart
        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;
        let cartObject = cartResultObject.result;

        // Check if Item is in Cart
        let isItemInCart = await this.isItemInCart(cartObject.items, itemId);

        // Update quantity and item total if the item is in the cart.
        if (isItemInCart.success) cartObject.items = increaseItemQuantity(cartObject.items, isItemInCart.result, quantityToAdd, itemObject);

        // Add the item to the cart if it's not already present.
        if (!isItemInCart.success) cartObject.items = addItemToItemsArray(cartObject.items, quantityToAdd, itemObject);

        // Update Cart Total
        cartObject = updateCartTotal(cartObject);

        // Update Variation Stock
        let updatedStock = currentStock - quantityToAdd;
        variationRepo.updateDirectly(itemId, { stock: updatedStock });

        // Update Cart and Return it to the customer
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


exports.removeItemFromList = async (customerId, itemId, quantityToRemove) => {
    try {
        // Get Customer Cart
        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;

        let cartObject = cartResultObject.result;

        // Check if Item is in Cart
        let isItemInCart = await cartRepo.isItemInCart(cartObject.items, itemId);
        if (!isItemInCart || !isItemInCart.success) return { success: false, code: 404, error: i18n.__("notFound") };


        let itemIndex = isItemInCart.result;
        let itemObject = cartObject.items[itemIndex];

        // Update Quantity and Item Total
        if (quantityToRemove >= itemObject.quantity) cartObject.items = removeItemFromItemsArray(cartObject.items, itemIndex);

        if (quantityToRemove < itemObject.quantity) cartObject.items = decreaseItemQuantity(cartObject.items, itemIndex, quantityToRemove, itemObject.variation);


        // Update Cart Total
        cartObject = updateCartTotal(cartObject);

        // Update Variation Stock
        let updatedStock = itemObject.variation.stock + quantityToRemove;
        variationRepo.updateDirectly(itemId, { stock: updatedStock });

        // Update Cart and Return
        let updatedCartResult = await cartRepo.updateDirectly(cartObject._id, cartObject);
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


exports.isItemInCart = async (arrayOfItemsObjects, itemId) => {
    try {
        itemId = mongoose.Types.ObjectId(itemId);
        const itemIndex = arrayOfItemsObjects.findIndex(itemObject => itemObject.variation.equals(itemId))

        if (itemIndex !== -1) return {
            success: true,
            result: itemIndex,
            code: 200
        };

        return {
            success: false,
            error: i18n.__("notFound"),
            code: 404
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


function calculateItemTotal(packagesArray, quantityToPurchase, minPackageObject) {
    packagesArray.sort((firstPackageObject, secondPackageObject) => secondPackageObject.quantity - firstPackageObject.quantity);

    let remainingQuantity = quantityToPurchase;
    let itemTotal = 0;

    for (const packageObject of packagesArray) {
        const selectedQuantity = Math.min(packageObject.quantity, remainingQuantity);
        itemTotal += packageObject.price;
        remainingQuantity -= selectedQuantity;
        if (remainingQuantity === 0) break;
    }

    if (remainingQuantity > 0) itemTotal += (remainingQuantity * minPackageObject.price);

    return itemTotal;
}


function addItemToItemsArray(cartItemsArray, quantityToAdd, itemObject) {
    let newQuantity = quantityToAdd;
    let itemTotal = calculateItemTotal(itemObject.packages, newQuantity, itemObject.minPackage);
    cartItemsArray.push({
        shop: itemObject.shop,
        product: itemObject.product,
        variation: itemObject._id,
        quantity: newQuantity,
        itemTotal: itemTotal
    });
    return cartItemsArray
}


function removeItemFromItemsArray(cartItems, itemIndex) {
    cartItems.splice(itemIndex, 1);
    return cartItems;
}


function increaseItemQuantity(cartItemsArray, itemIndex, quantityToAdd, itemObject) {
    let existingQuantity = cartItemsArray[itemIndex].quantity;
    let newQuantity = existingQuantity + quantityToAdd;
    let itemTotal = calculateItemTotal(itemObject.packages, newQuantity, itemObject.minPackage);
    cartItemsArray[itemIndex].quantity = newQuantity;
    cartItemsArray[itemIndex].itemTotal = itemTotal;
    return cartItemsArray
}


function decreaseItemQuantity(cartItems, itemIndex, quantityToRemove, variation) {
    let newQuantity = cartItems[itemIndex].quantity - quantityToRemove;
    let itemTotal = calculateItemTotal(variation.packages, newQuantity, variation.minPackage);

    // Update existing item in the cart
    cartItems[itemIndex].quantity = newQuantity;
    cartItems[itemIndex].itemTotal = itemTotal;

    return cartItems;
}


function updateCartTotal(cartObject) {
    let cartTotal = cartObject.items.reduce((total, item) => total + item.itemTotal, 0);
    cartObject.itemsTotal = cartTotal;
    cartObject.originalItemsTotal = cartTotal;
    return cartObject
}


function isStockAvailable(currentStock, quantityToAdd) {
    return currentStock > 0 && currentStock >= quantityToAdd;
}
