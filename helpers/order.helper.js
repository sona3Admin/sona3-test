const { getSettings } = require("./settings.helper")
const customerRepo = require("../modules/Customer/customer.repo")


exports.setShopItems = (shopItemsArray, productsArray, variationsArray, categoriesArray) => {
    try {
        let itemsArray = []
        for (let itemIndex = 0; itemIndex < shopItemsArray.length; itemIndex++) {
            let productCategories = Array.from(shopItemsArray[itemIndex]?.product?.categories)
            itemsArray.push({
                product: { ...shopItemsArray[itemIndex].product },
                variation: { ...shopItemsArray[itemIndex].variation },
                quantity: shopItemsArray[itemIndex].quantity,
                itemTotal: shopItemsArray[itemIndex].itemTotal,
            })
            if (!productsArray.includes(((shopItemsArray[itemIndex]).product._id).toString())) productsArray.push(((shopItemsArray[itemIndex]).product._id).toString())
            if (!variationsArray.includes(((shopItemsArray[itemIndex]).variation._id).toString())) variationsArray.push(((shopItemsArray[itemIndex]).variation._id).toString())
            productCategories.forEach((categoryId) => {
                if (!categoriesArray.includes(categoryId.toString())) categoriesArray.push(categoryId.toString())
            })
        }

        return { items: itemsArray, products: productsArray, variations: variationsArray, categories: categoriesArray }
    } catch (err) {
        console.log("err.message setShopItems", err.message);
    }
}


exports.setSubOrders = (subCartsArray) => {
    try {
        let subOrdersArray = [];
        let sellersArray = [];
        let shopsArray = [];
        let productsArray = [];
        let variationsArray = [];
        let categoriesArray = [];

        for (let shopCartIndex = 0; shopCartIndex < subCartsArray.length; shopCartIndex++) {
            let shopData = subCartsArray[shopCartIndex].shop
            const shopId = (shopData._id).toString();
            const shopsItem = this.setShopItems(subCartsArray[shopCartIndex].items, productsArray, variationsArray, categoriesArray);
            if (!sellersArray.includes(shopData.seller.toString())) sellersArray.push(shopData.seller.toString())
            shopsArray.push(shopId);
            subOrdersArray.push({
                seller: shopData.seller.toString(),
                shop: shopId,
                items: shopsItem.items,
                shopTotal: subCartsArray[shopCartIndex].shopTotal,
                shopOriginalTotal: subCartsArray[shopCartIndex].shopOriginalTotal,
                shopTaxes: 0,
                shopShippingFees: 0,
                coupon: (subCartsArray[shopCartIndex]?.coupon) || undefined,
                subOrderTotal: subCartsArray[shopCartIndex].shopTotal,
            });
        }

        return { subOrders: subOrdersArray, sellers: sellersArray, shops: shopsArray, products: productsArray, variations: variationsArray, categories: categoriesArray };
    } catch (err) {
        console.log("err.message setSubOrders", err.message);
    }
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
        customerOrderObject.sellers = resultObject.sellers
        customerOrderObject.shops = resultObject.shops
        customerOrderObject.products = resultObject.products
        customerOrderObject.variations = resultObject.variations
        customerOrderObject.categories = resultObject.categories
        customerOrderObject.cartTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.orderTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.cartOriginalTotal = parseFloat(customerCartObject.cartOriginalTotal)
        customerOrderObject.coupon = customerCartObject?.coupon || undefined
        customerOrderObject.usedCashback = parseInt(customerCartObject?.usedCashback) || 0
        customerOrderObject.taxesRate = parseFloat(getSettings("vatRate"))
        customerOrderObject.taxesTotal = 0

        let subOrders = customerOrderObject.subOrders
        subOrders.forEach((shopObject) => this.addOrderTaxes(shopObject, customerOrderObject))

        this.calculateCashback(customerCartObject);
        return customerOrderObject

    } catch (err) {
        console.log("err.message", err.message);
    }
}


exports.calculateCashback = async (customerCartObject) => {
    try {
        const cashbackPercentage = await getSettings('cashbackPercentage');
        const cashbackThreshold = await getSettings('cashbackThreshold');
        const orderTotal = parseInt(customerCartObject?.cartOriginalTotal)
        const hasPurchasedBefore = customerCartObject?.customer?.hasPurchased
        const isCustomerBirthday = this.isDateEqualToToday(customerCartObject?.customer?.birthDate)
        let customerPoints = parseInt(customerCartObject?.customer?.loyaltyPoints)
        let customerCashback = parseInt(customerCartObject?.customer?.cashback)
        let updateForm = { hasPurchased: hasPurchasedBefore, cashback: customerCashback, loyaltyPoints: customerPoints }

        let newPoints = customerPoints + orderTotal

        if (!hasPurchasedBefore) {
            // First-time purchaser: Apply welcome cashback
            const welcomePercentage = 0.01
            const welcomeCashback = orderTotal * welcomePercentage
            customerCashback += parseInt(welcomeCashback)
            updateForm.hasPurchased = true;
            updateForm.cashback = customerCashback
        }

        // Update loyalty points if below the cashback threshold
        if (newPoints < parseInt(cashbackThreshold) && hasPurchasedBefore) updateForm.loyaltyPoints = newPoints


        if (isCustomerBirthday && (newPoints >= parseInt(cashbackThreshold))) {
            // Birthday cashback for eligible customers
            const birthdayPercentage = 0.02
            const birthdayCashback = cashbackThreshold * birthdayPercentage
            customerCashback += parseInt(birthdayCashback);
            updateForm.cashback = customerCashback
        }

        if (newPoints >= parseInt(cashbackThreshold)) {
            // normal case
            customerCashback += (parseInt(cashbackThreshold) * parseFloat(cashbackPercentage))
            newPoints -= cashbackThreshold
            updateForm.cashback = customerCashback
            updateForm.loyaltyPoints = newPoints
        }

        customerRepo.updateDirectly((customerCartObject?.customer?._id).toString(), updateForm)

        return
    } catch (err) {
        console.log("err.message", err.message);
        return
    }
}


exports.isDateEqualToToday = (isoStringDate) => {
    try {
        const isoDate = new Date(isoStringDate);
        const currentDate = new Date();
        const currentIsoDate = currentDate.toISOString();

        // Today is the same day as the ISO string date.
        if (currentIsoDate.slice(0, 10) === isoDate.slice(0, 10)) return true

        return false

    } catch {
        return false
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


exports.listSellerOrders = (arrayOfOrders, sellerId) => {
    console.log("seller", sellerId);
    arrayOfOrders = arrayOfOrders.map((orderObject) => {
        const subOrders = [...orderObject.subOrders]; // Shallow copy
        const filteredSubOrders = subOrders.filter((subOrder) => {
            return subOrder?.seller?.toString() == sellerId
        });
        return { ...orderObject, subOrders: filteredSubOrders };
    });
    return arrayOfOrders;
};


exports.getSellerOrder = (orderObject, sellerId) => {
    const subOrders = [...orderObject.subOrders]; // Shallow copy
    const filteredSubOrders = subOrders.filter((subOrder) => { return subOrder.seller.toString() === sellerId });
    return { ...orderObject, subOrders: filteredSubOrders };
}