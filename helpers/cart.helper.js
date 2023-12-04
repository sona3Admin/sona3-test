const mongoose = require("mongoose");
const i18n = require('i18n');


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
    console.log(`increaseItemQuantity`);
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
    console.log("itemIndex", itemIndex);
    shopCartObject.shopCartItems.splice(itemIndex, 1);
    console.log("removeItemFromItemsArray");
    this.calculateShopTotal(shopCartObject)
    return shopCartObject.shopCartItems;
}


exports.removeShopFromSubCartsArray = (shopCarts, subCartIndex) => {
    shopCarts.splice(subCartIndex, 1);
    console.log("removeShopFromSubCartsArray");
    return shopCarts;
}


exports.decreaseItemQuantity = (shopCartObject, shopCartItems, itemIndex, quantityToRemove, variation) => {

    itemIndex = parseInt(itemIndex); quantityToRemove = parseInt(quantityToRemove)
    console.log(typeof(itemIndex));
    let newQuantity = parseInt(shopCartItems[itemIndex].quantity) - quantityToRemove;
    let itemTotal = this.calculateItemTotal(variation.packages, newQuantity, variation.minPackage);

    // Update existing item in the cart
    shopCartItems[itemIndex].quantity = newQuantity;
    shopCartItems[itemIndex].itemTotal = itemTotal;
    console.log(`decreaseItemQuantity`);

    this.calculateShopTotal(shopCartObject)
    return shopCartObject.shopCartItems;
}


exports.addNewSubCart = (cartObject, itemObject, quantityToAdd) => {
    cartObject.subCarts = this.addShopToSubCartsArray(cartObject.subCarts, itemObject.shop)
    let shopCartIndex = parseInt(cartObject.subCarts.length) - 1
    let shopCartObject = cartObject.subCarts[shopCartIndex]
    console.log("addNewSubCart");

    shopCartObject.items = this.addItemToItemsArray(shopCartObject.items, parseInt(quantityToAdd), itemObject);
    this.calculateShopTotal(shopCartObject)
}


exports.updateExistingSubCart = (cartObject, subCartIndex, itemObject, itemId, quantityToAdd) => {
    console.log(`updating existing sub cart`);
    let shopCartIndex = parseInt(subCartIndex)
    let shopCartObject = cartObject.subCarts[shopCartIndex]
    let isItemInShopCart = this.isIdInArray(shopCartObject.items, "variation", itemId);
    console.log(`isItemInShopCart`, isItemInShopCart);

    if (isItemInShopCart.success) shopCartObject.items = this.increaseItemQuantity(shopCartObject.items, shopCartIndex, parseInt(quantityToAdd), itemObject);

    if (!isItemInShopCart.success) shopCartObject.items = this.addItemToItemsArray(shopCartObject.items, parseInt(quantityToAdd), itemObject);
    this.calculateShopTotal(shopCartObject)

}


exports.calculateItemTotal = (packagesArray, quantityToPurchase, minPackageObject) => {

    packagesArray.sort((firstPackageObject, secondPackageObject) => secondPackageObject.quantity - firstPackageObject.quantity);

    let remainingQuantity = parseInt(quantityToPurchase);
    let itemTotal = parseInt(0);

    for (const packageObject of packagesArray) {
        const selectedQuantity = Math.min(packageObject.quantity, remainingQuantity);
        itemTotal += parseFloat(packageObject.price);

        remainingQuantity -= parseInt(selectedQuantity);

        if (remainingQuantity === 0) break;
    }

    if (remainingQuantity > 0) itemTotal += remainingQuantity * parseFloat(minPackageObject.price);
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
