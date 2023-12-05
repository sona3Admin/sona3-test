const { getSettings } = require("./settings.helper")


exports.setShopItems = (shopItemsArray) => {
    let itemsArray = []
    for (let itemIndex = 0; itemIndex < shopItemsArray.length; itemIndex++){
        itemsArray.push({
            product: {...shopItemsArray[itemIndex].product},
            variation: {...shopItemsArray[itemIndex].variation},
            quantity: shopItemsArray[itemIndex].quantity,
            itemTotal: shopItemsArray[itemIndex].itemTotal,
        })
    }
    console.log("itemsArray ready");

    return itemsArray
}


exports.setSubOrders = (subCartsArray) => {
    let subOrdersArray = []
    for (let shopCartIndex = 0; shopCartIndex < subCartsArray.length; shopCartIndex++){
        subOrdersArray.push({
            shop: subCartsArray[shopCartIndex].shop,
            items: this.setShopItems(subCartsArray[shopCartIndex].items),
            shopTotal: subCartsArray[shopCartIndex].shopTotal,
            shopOriginalTotal: subCartsArray[shopCartIndex].shopOriginalTotal,
            shopTaxes: 0,
            shopShippingFees: 0,
            subOrderTotal: subCartsArray[shopCartIndex].shopTotal
        })
    }
    console.log("subOrdersArray ready");

    return subOrdersArray
}


exports.calculateValueAddedTax = (itemsArray, vatRateNumber) => {
    const vatValue = parseFloat(vatRateNumber / 100)
    if (typeof vatRateNumber !== 'number' || vatRateNumber < 0 || typeof vatValue !== 'number') return 'Invalid input. Please provide a valid array of items and a non-negative VAT rate.'

    let taxesTotal = parseFloat(0);

    itemsArray.forEach(itemObject => {
        const vatAmount = vatValue * parseFloat(itemObject.itemTotal);
        taxesTotal += vatAmount;
    });

    return taxesTotal;
}


exports.addOrderTaxes = (shopObject, customerOrderObject) => {
    shopObject.shopTaxes = this.calculateValueAddedTax(shopObject.items, customerOrderObject.taxesRate)
    shopObject.subOrderTotal = parseFloat(shopObject.shopTaxes) + parseFloat(shopObject.shopTotal)
    customerOrderObject.taxesTotal += parseFloat(shopObject.shopTaxes)
    customerOrderObject.orderTotal += parseFloat(customerOrderObject.taxesTotal)
}


exports.handleOrderCreation = async (customerCartObject, customerOrderObject) => {
    try {
        customerOrderObject.subOrders = this.setSubOrders(customerCartObject.subCarts)
        customerOrderObject.cartTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.orderTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.cartOriginalTotal = parseFloat(customerCartObject.cartOriginalTotal)
        customerOrderObject.taxesRate = parseFloat(getSettings("vatRate"))
        customerOrderObject.taxesTotal = 0

        let subOrders = customerOrderObject.subOrders
        subOrders.forEach((shopObject) => this.addOrderTaxes(shopObject, customerOrderObject))

        return customerOrderObject

    } catch (err) {
        console.log("err.message", err.message);
    }
}