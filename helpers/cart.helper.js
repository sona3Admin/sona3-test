const mongoose = require("mongoose");
const i18n = require('i18n');
const { ObjectId } = require('mongodb');
const { logInTestEnv } = require("./logger.helper");


exports.generateSubCartId = () => {
    return new ObjectId().toString().substr(0, 15);
}

exports.isStockAvailable = (currentStock, quantityToAdd) => {
    return currentStock > 0 && currentStock >= quantityToAdd;
}


exports.isIdInArray = (arrayOfObjects, targetField, targetId) => {
    try {
        targetId = mongoose.Types.ObjectId(targetId);
        const itemIndex = arrayOfObjects.findIndex(object => object[`${targetField}`].equals(targetId))
        if (itemIndex !== -1) return { success: true, result: itemIndex, code: 200 }
        logInTestEnv(`item not found in`, targetField, "array");
        return { success: false, error: i18n.__("notFound"), code: 404 }

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return { success: false, code: 500, error: i18n.__("internalServerError") }
    }
}


exports.findObjectInArray = (arrayOfObjects, targetField, targetId) => {
    try {

        for (let i = 0; i < arrayOfObjects.length; i++) {
            if (arrayOfObjects[i][targetField] == targetId) return {
                success: true,
                result: arrayOfObjects[i],
                index: i,
                code: 200
            };

        }
        logInTestEnv(`item not found in`, targetField, "array");
        return { success: false, error: i18n.__("notFound"), code: 404 };
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return { success: false, code: 500, error: i18n.__("internalServerError") };
    }
}



exports.increaseItemQuantity = (cartItemsArray, itemIndex, quantityToAdd, itemObject) => {
    let existingQuantity = cartItemsArray[itemIndex].quantity;
    let newQuantity = parseInt(existingQuantity) + quantityToAdd;
    let itemTotal = this.calculateItemTotal(itemObject.packages, newQuantity, itemObject.minPackage, itemObject.defaultPackage);
    cartItemsArray[itemIndex].quantity = newQuantity;
    cartItemsArray[itemIndex].itemTotal = itemTotal;
    logInTestEnv("itemIndex", itemIndex);
    logInTestEnv(`increaseItemQuantity`);
    logInTestEnv("itemId", itemObject._id);
    return cartItemsArray
}


exports.addShopToSubCartsArray = (subCartsArray, shopId) => {
    subCartsArray.push({
        shop: shopId,
        items: [],
        shopTotal: 0,
        shopOriginalTotal: 0
    });
    logInTestEnv(`addShopToSubCartsArray`);
    return subCartsArray
}


exports.addItemToItemsArray = (cartItemsArray, quantityToAdd, itemObject) => {
    let newQuantity = quantityToAdd;
    logInTestEnv(`newQuantity`, newQuantity);
    let itemTotal = this.calculateItemTotal(itemObject.packages, newQuantity, itemObject.minPackage, itemObject.defaultPackage);
    cartItemsArray.push({
        shop: itemObject.shop,
        product: itemObject.product,
        variation: itemObject._id,
        quantity: newQuantity,
        itemTotal: itemTotal
    });
    logInTestEnv("addItemToItemsArray");

    return cartItemsArray
}


exports.removeItemFromItemsArray = (shopCartObject, itemIndex) => {
    shopCartObject.items.splice(itemIndex, 1);
    logInTestEnv("removeItemFromItemsArray");
    this.calculateShopTotal(shopCartObject)
    return shopCartObject.items;
}


exports.removeShopFromSubCartsArray = (shopCarts, subCartIndex) => {
    shopCarts.splice(subCartIndex, 1);
    logInTestEnv("removeShopFromSubCartsArray");
    return shopCarts;
}


exports.decreaseItemQuantity = (shopCartObject, shopCartItems, itemIndex, quantityToRemove, variation) => {
    try {
        logInTestEnv("decrease item quantity");
        logInTestEnv("variation.defaultPackage------", variation)
        itemIndex = parseInt(itemIndex); quantityToRemove = parseInt(quantityToRemove)
        let newQuantity = parseInt(shopCartItems[itemIndex].quantity) - quantityToRemove;
        let itemTotal = this.calculateItemTotal(variation.packages, newQuantity, variation.minPackage, variation.defaultPackage);
        shopCartItems[itemIndex].quantity = newQuantity;
        shopCartItems[itemIndex].itemTotal = itemTotal;
        shopCartObject.items = shopCartItems
        this.calculateShopTotal(shopCartObject)
        return shopCartObject.items;
    } catch (err) {
        logInTestEnv("err in decreaseItemQuantity", err.message)
    }
}


exports.addNewSubCart = (cartObject, itemObject, quantityToAdd) => {
    cartObject.subCarts = this.addShopToSubCartsArray(cartObject.subCarts, itemObject.shop)
    let shopCartIndex = parseInt(cartObject.subCarts.length) - 1
    let shopCartObject = cartObject.subCarts[shopCartIndex]
    logInTestEnv("addNewSubCart");
    logInTestEnv(`quantityToAdd`, quantityToAdd);
    shopCartObject._id = this.generateSubCartId()
    shopCartObject.items = this.addItemToItemsArray(shopCartObject.items, parseInt(quantityToAdd), itemObject);
    this.calculateShopTotal(shopCartObject)
}


exports.updateExistingSubCart = (cartObject, subCartIndex, itemObject, itemId, quantityToAdd) => {
    logInTestEnv(`updating existing sub cart`);
    let shopCartIndex = parseInt(subCartIndex)
    let shopCartObject = cartObject.subCarts[shopCartIndex]
    let isItemInShopCart = this.isIdInArray(shopCartObject.items, "variation", itemId);
    logInTestEnv(`isItemInShopCart`, isItemInShopCart.success);
    logInTestEnv("itemId", itemId);
    logInTestEnv(`itemIndex`, isItemInShopCart.result);
    let itemIndex = isItemInShopCart.result
    if (isItemInShopCart.success) shopCartObject.items = this.increaseItemQuantity(shopCartObject.items, itemIndex, parseInt(quantityToAdd), itemObject);

    if (!isItemInShopCart.success) shopCartObject.items = this.addItemToItemsArray(shopCartObject.items, parseInt(quantityToAdd), itemObject);
    this.calculateShopTotal(shopCartObject)

}


exports.calculateItemTotal = (packagesArray, quantityToPurchase, minPackageObject, defaultPackage) => {

    let remainingQuantity = quantityToPurchase;
    let itemTotal = 0;
    logInTestEnv(`calculating item total`);
    logInTestEnv("defaultPackage", defaultPackage)

    packagesArray.push(defaultPackage)
    logInTestEnv("packagesArray", packagesArray)
    let smallestPackage = findPackageWithSmallestQuantity(packagesArray) || minPackageObject
    while (remainingQuantity >= smallestPackage.quantity) {
        const selectedPackage = selectPackage(packagesArray, remainingQuantity) || minPackageObject;
        itemTotal += selectedPackage.price;

        remainingQuantity -= selectedPackage.quantity;

        if (remainingQuantity === 0) break;
    }

    if (remainingQuantity > 0) itemTotal += (remainingQuantity * minPackageObject.price);
    logInTestEnv("calculated item total");
    return itemTotal;
}


exports.calculateShopTotal = (shopCartObject) => {
    let shopTotal = shopCartObject.items.reduce((total, item) => parseFloat(total) + parseFloat(item.itemTotal), 0);
    shopCartObject.shopTotal = shopTotal;
    shopCartObject.shopOriginalTotal = shopTotal;
    if (shopCartObject?.usedCashback) shopCartObject.shopTotal -= shopCartObject?.usedCashback
    if (shopCartObject.shopTotal < 0) shopCartObject.shopTotal = 0
    logInTestEnv("calculated shop total");

    return shopCartObject
}


exports.calculateCartTotal = (cartObject) => {
    let cartTotal = cartObject.subCarts.reduce((total, subCart) => parseFloat(total) + parseFloat(subCart.shopTotal), 0);
    let cartOriginalTotal = cartObject.subCarts.reduce((total, subCart) => parseFloat(total) + parseFloat(subCart.shopOriginalTotal), 0);
    cartObject.cartTotal = cartTotal;
    cartObject.cartOriginalTotal = cartOriginalTotal;
    if (cartObject?.coupon) cartObject = this.applyCoupon(cartObject)
    if (cartObject.cartTotal < 0) cartObject.cartTotal = 0

    logInTestEnv("calculated cart total");
    return cartObject
}


exports.applyCoupon = (cartObject) => {
    logInTestEnv("Cart has coupon!")
    let isShopInSubCarts = this.isIdInArray(cartObject.subCarts, "shop", cartObject?.couponShop.toString())
    let subCartObject = cartObject.subCarts[isShopInSubCarts.result]
    if (!isShopInSubCarts || !isShopInSubCarts.success) {
        delete cartObject["coupon"]
        delete cartObject["couponShop"]
        return cartObject
    }

    if (cartObject?.coupon?.discountType == "value") {
        subCartObject.shopTotal = parseFloat(subCartObject.shopTotal) - parseFloat(cartObject?.coupon?.value)
        cartObject.cartTotal = parseFloat(cartObject.cartTotal) - parseFloat(cartObject?.coupon?.value)
    }

    if (cartObject?.coupon?.discountType == "percentage") {
        subCartObject.shopTotal = parseFloat(subCartObject.shopTotal) - (parseFloat(cartObject?.coupon?.percentage) * parseFloat(subCartObject.shopTotal))
        cartObject.cartTotal = parseFloat(cartObject.cartTotal) - (parseFloat(cartObject?.coupon?.percentage) * parseFloat(subCartObject.shopTotal))
    }
    if (subCartObject.shopTotal < 0) subCartObject.shopTotal = 0;
    if (cartObject.cartTotal < 0) cartObject.cartTotal = 0;

    return cartObject
}


function selectPackage(arrayOfObjects, givenNumber) {
    let selectedPackage = null;
    logInTestEnv(`givenNumber`, givenNumber);
    for (const packageObject of arrayOfObjects) {
        if (packageObject.quantity <= givenNumber && (!selectedPackage || packageObject.quantity > selectedPackage.quantity)) {
            selectedPackage = packageObject;
        }
    }

    return selectedPackage;
}


function findPackageWithSmallestQuantity(arrayOfObjects) {
    if (arrayOfObjects.length === 0) return null; // Return null for an empty array

    let smallestQuantityPackage = arrayOfObjects[0];
    logInTestEnv(`finding package`);
    for (let i = 1; i < arrayOfObjects.length; i++) {
        logInTestEnv(`arrayOfObjects[i].quantity`, arrayOfObjects[i]?.quantity);
        logInTestEnv(`smallestQuantityPackage.quantity`, smallestQuantityPackage?.quantity);
        if (arrayOfObjects[i].quantity < smallestQuantityPackage.quantity)
            smallestQuantityPackage = arrayOfObjects[i];

    }

    return smallestQuantityPackage;
}