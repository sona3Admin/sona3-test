const mongoose = require("mongoose");
const i18n = require('i18n');
const { ObjectId } = require('mongodb');


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
        console.log(`item not found in`, targetField, "array");
        return { success: false, error: i18n.__("notFound"), code: 404 }

    } catch (err) {
        console.log(`err.message`, err.message);
        return { success: false, code: 500, error: i18n.__("internalServerError") }
    }
}


exports.increaseItemQuantity = (cartItemsArray, itemIndex, quantityToAdd, itemObject) => {
    let existingQuantity = cartItemsArray[itemIndex].quantity;
    let newQuantity = parseInt(existingQuantity) + quantityToAdd;
    let itemTotal = this.calculateItemTotal(itemObject.packages, newQuantity, itemObject.minPackage);
    cartItemsArray[itemIndex].quantity = newQuantity;
    cartItemsArray[itemIndex].itemTotal = itemTotal;
    console.log("itemIndex", itemIndex);
    console.log(`increaseItemQuantity`);
    console.log("itemId", itemObject._id);
    return cartItemsArray
}


exports.addShopToSubCartsArray = (subCartsArray, shopId) => {
    subCartsArray.push({
        shop: shopId,
        items: [],
        shopTotal: 0,
        shopOriginalTotal: 0
    });
    console.log(`addShopToSubCartsArray`);
    return subCartsArray
}


exports.addItemToItemsArray = (cartItemsArray, quantityToAdd, itemObject) => {
    let newQuantity = quantityToAdd;
    console.log(`newQuantity`, newQuantity);
    let itemTotal = this.calculateItemTotal(itemObject.packages, newQuantity, itemObject.minPackage);
    cartItemsArray.push({
        shop: itemObject.shop,
        product: itemObject.product,
        variation: itemObject._id,
        quantity: newQuantity,
        itemTotal: itemTotal
    });
    console.log("addItemToItemsArray");

    return cartItemsArray
}


exports.removeItemFromItemsArray = (shopCartObject, itemIndex) => {
    shopCartObject.items.splice(itemIndex, 1);
    console.log("removeItemFromItemsArray");
    this.calculateShopTotal(shopCartObject)
    return shopCartObject.items;
}


exports.removeShopFromSubCartsArray = (shopCarts, subCartIndex) => {
    shopCarts.splice(subCartIndex, 1);
    console.log("removeShopFromSubCartsArray");
    return shopCarts;
}


exports.decreaseItemQuantity = (shopCartObject, shopCartItems, itemIndex, quantityToRemove, variation) => {
    console.log("decrease item quantity");
    itemIndex = parseInt(itemIndex); quantityToRemove = parseInt(quantityToRemove)
    let newQuantity = parseInt(shopCartItems[itemIndex].quantity) - quantityToRemove;
    let itemTotal = this.calculateItemTotal(variation.packages, newQuantity, variation.minPackage);
    shopCartItems[itemIndex].quantity = newQuantity;
    shopCartItems[itemIndex].itemTotal = itemTotal;
    shopCartObject.items = shopCartItems
    this.calculateShopTotal(shopCartObject)
    return shopCartObject.items;
}


exports.addNewSubCart = (cartObject, itemObject, quantityToAdd) => {
    cartObject.subCarts = this.addShopToSubCartsArray(cartObject.subCarts, itemObject.shop)
    let shopCartIndex = parseInt(cartObject.subCarts.length) - 1
    let shopCartObject = cartObject.subCarts[shopCartIndex]
    console.log("addNewSubCart");
    console.log(`quantityToAdd`, quantityToAdd);
    shopCartObject._id = this.generateSubCartId()
    shopCartObject.items = this.addItemToItemsArray(shopCartObject.items, parseInt(quantityToAdd), itemObject);
    this.calculateShopTotal(shopCartObject)
}


exports.updateExistingSubCart = (cartObject, subCartIndex, itemObject, itemId, quantityToAdd) => {
    console.log(`updating existing sub cart`);
    let shopCartIndex = parseInt(subCartIndex)
    let shopCartObject = cartObject.subCarts[shopCartIndex]
    let isItemInShopCart = this.isIdInArray(shopCartObject.items, "variation", itemId);
    console.log(`isItemInShopCart`, isItemInShopCart.success);
    console.log("itemId", itemId);
    console.log(`itemIndex`, isItemInShopCart.result);
    let itemIndex = isItemInShopCart.result
    if (isItemInShopCart.success) shopCartObject.items = this.increaseItemQuantity(shopCartObject.items, itemIndex, parseInt(quantityToAdd), itemObject);

    if (!isItemInShopCart.success) shopCartObject.items = this.addItemToItemsArray(shopCartObject.items, parseInt(quantityToAdd), itemObject);
    this.calculateShopTotal(shopCartObject)

}


exports.calculateItemTotal = (packagesArray, quantityToPurchase, minPackageObject) => {

    let remainingQuantity = quantityToPurchase;
    let itemTotal = 0;
    console.log(`calculating item total`);
    let smallestPackage = findPackageWithSmallestQuantity(packagesArray) || minPackageObject
    while (remainingQuantity >= smallestPackage.quantity) {
        const selectedPackage = selectPackage(packagesArray, remainingQuantity) || minPackageObject;
        itemTotal += selectedPackage.price;

        remainingQuantity -= selectedPackage.quantity;

        if (remainingQuantity === 0) break;
    }

    if (remainingQuantity > 0) itemTotal += (remainingQuantity * minPackageObject.price);
    console.log("calculated item total");
    return itemTotal;
}


exports.calculateShopTotal = (shopCartObject) => {
    let shopTotal = shopCartObject.items.reduce((total, item) => parseFloat(total) + parseFloat(item.itemTotal), 0);
    shopCartObject.shopTotal = shopTotal;
    shopCartObject.shopOriginalTotal = shopTotal;
    console.log("calculated shop total");

    return shopCartObject
}


exports.calculateCartTotal = (cartObject) => {
    let cartTotal = cartObject.subCarts.reduce((total, subCart) => parseFloat(total) + parseFloat(subCart.shopTotal), 0);
    cartObject.cartTotal = cartTotal;
    cartObject.cartOriginalTotal = cartTotal;
    console.log("calculated cart total");
    return cartObject
}


function selectPackage(arrayOfObjects, givenNumber) {
    let selectedPackage = null;
    console.log(`givenNumber`, givenNumber);
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
    console.log(`finding package`);
    for (let i = 1; i < arrayOfObjects.length; i++) {
        console.log(`arrayOfObjects[i].quantity`, arrayOfObjects[i]?.quantity);
        console.log(`smallestQuantityPackage.quantity`, smallestQuantityPackage?.quantity);
        if (arrayOfObjects[i].quantity < smallestQuantityPackage.quantity)
            smallestQuantityPackage = arrayOfObjects[i];

    }

    return smallestQuantityPackage;
}