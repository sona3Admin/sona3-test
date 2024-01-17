const { getSettings } = require("./settings.helper")


exports.setShopItems = (shopItemsArray, productsArray, variationsArray) => {
    let itemsArray = []
    for (let itemIndex = 0; itemIndex < shopItemsArray.length; itemIndex++) {
        itemsArray.push({
            product: { ...shopItemsArray[itemIndex].product },
            variation: { ...shopItemsArray[itemIndex].variation },
            quantity: shopItemsArray[itemIndex].quantity,
            itemTotal: shopItemsArray[itemIndex].itemTotal,
        })
        if (!productsArray.includes(((shopItemsArray[itemIndex]).product._id).toString())) productsArray.push(((shopItemsArray[itemIndex]).product._id).toString())
        if (!variationsArray.includes(((shopItemsArray[itemIndex]).variation._id).toString())) variationsArray.push(((shopItemsArray[itemIndex]).variation._id).toString())
    }

    return { items: itemsArray, products: productsArray, variations: variationsArray }
}


exports.setSubOrders = (subCartsArray) => {
    let subOrdersArray = [];
    let shopsArray = [];
    let productsArray = [];
    let variationsArray = [];

    for (let shopCartIndex = 0; shopCartIndex < subCartsArray.length; shopCartIndex++) {
        const shopId = (subCartsArray[shopCartIndex].shop._id).toString();
        const shopsItem = this.setShopItems(subCartsArray[shopCartIndex].items, productsArray, variationsArray);
        shopsArray.push(shopId);

        subOrdersArray.push({
            shop: subCartsArray[shopCartIndex].shop,
            items: shopsItem.items,
            shopTotal: subCartsArray[shopCartIndex].shopTotal,
            shopOriginalTotal: subCartsArray[shopCartIndex].shopOriginalTotal,
            shopTaxes: 0,
            shopShippingFees: 0,
            coupon: (subCartsArray[shopCartIndex]?.coupon) || undefined,
            subOrderTotal: subCartsArray[shopCartIndex].shopTotal,
        });
    }

    return { subOrders: subOrdersArray, shops: shopsArray, products: productsArray, variations: variationsArray };
};



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
        let resultObject = this.setSubOrders(customerCartObject.subCarts)
        customerOrderObject.subOrders = resultObject.subOrders
        customerOrderObject.shops = resultObject.shops
        customerOrderObject.products = resultObject.products
        customerOrderObject.variations = resultObject.variations
        customerOrderObject.cartTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.orderTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.cartOriginalTotal = parseFloat(customerCartObject.cartOriginalTotal)
        customerOrderObject.coupon = customerCartObject?.coupon || undefined
        customerOrderObject.taxesRate = parseFloat(getSettings("vatRate"))
        customerOrderObject.taxesTotal = 0

        let subOrders = customerOrderObject.subOrders
        subOrders.forEach((shopObject) => this.addOrderTaxes(shopObject, customerOrderObject))

        return customerOrderObject

    } catch (err) {
        console.log("err.message", err.message);
    }
}



exports.listShopOrders = (arrayOfOrders, shopId) => {
    arrayOfOrders = arrayOfOrders.map((orderObject) => {
        const subOrders = [...orderObject.subOrders]; // Shallow copy
        const filteredSubOrders = subOrders.filter((subOrder) => {
            return subOrder.shop._id.toString() == shopId
        });
        return { ...orderObject, subOrders: filteredSubOrders };
    });
    return arrayOfOrders;
};


exports.getShopOrder = (orderObject, shopId) => {
    const subOrders = [...orderObject.subOrders]; // Shallow copy
    const filteredSubOrders = subOrders.filter((subOrder) => { return subOrder.shop._id.toString() === shopId });
    return { ...orderObject, subOrders: filteredSubOrders };
}