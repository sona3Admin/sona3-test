const { getSettings, listSettings } = require("./settings.helper")
const customerRepo = require("../modules/Customer/customer.repo")
const { findObjectInArray, generateSubCartId } = require("./cart.helper")
const { logInTestEnv } = require("./logger.helper");


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
        logInTestEnv("err.message setShopItems", err.message);
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
                _id: subCartsArray[shopCartIndex]._id,
                seller: shopData.seller.toString(),
                name: shopData.nameEn || shopData.nameAr,
                phone: shopData.phone,
                address: shopData.address,
                location: shopData.location,
                shop: shopId,
                items: shopsItem.items,
                shopTotal: subCartsArray[shopCartIndex].shopTotal,
                shopOriginalTotal: subCartsArray[shopCartIndex].shopOriginalTotal,
                shopTaxes: 0,
                shopShippingFees: 0,
                coupon: (subCartsArray[shopCartIndex]?.coupon) || undefined,
                usedCashback: (subCartsArray[shopCartIndex]?.usedCashback) || 0,
                subOrderTotal: subCartsArray[shopCartIndex].shopTotal,
            });
        }

        return { subOrders: subOrdersArray, sellers: sellersArray, shops: shopsArray, products: productsArray, variations: variationsArray, categories: categoriesArray };
    } catch (err) {
        logInTestEnv("err.message setSubOrders", err.message);
    }
};


exports.calculateValueAddedTax = (shopObject, vatRateNumber) => {
    const vatValue = parseFloat(vatRateNumber / 100)
    if (typeof vatRateNumber !== 'number' || vatRateNumber < 0 || typeof vatValue !== 'number') return 'Invalid input. Please provide a valid array of items and a non-negative VAT rate.'

    let taxesTotal = parseFloat(0);
    taxesTotal = vatValue * parseFloat(shopObject.shopTotal);
    // itemsArray.forEach(itemObject => {
    //     const vatAmount = vatValue * parseFloat(itemObject.itemTotal);
    //     taxesTotal += vatAmount;
    // });

    return taxesTotal;
}


exports.addOrderTaxes = (shopObject, customerOrderObject, isFood) => {
    shopObject.shopTaxes = this.calculateValueAddedTax(shopObject, customerOrderObject.taxesRate)
    shopObject.subOrderTotal = parseFloat(shopObject.shopTaxes) + parseFloat(shopObject.shopTotal)
    customerOrderObject.taxesTotal += parseFloat(shopObject.shopTaxes)
    customerOrderObject.orderTotal += parseFloat(shopObject.shopTaxes)
    if (isFood) this.addOrderShippingFees(shopObject, customerOrderObject)
}


exports.addOrderShippingFees = (shopObject, customerOrderObject) => {
    const ifastShippingCost = 21
    shopObject.shopShippingFees = ifastShippingCost
    shopObject.subOrderTotal = parseFloat(shopObject.shopShippingFees) + parseFloat(shopObject.shopTotal) + parseFloat(shopObject.shopTaxes)
    customerOrderObject.shippingFeesTotal += parseFloat(shopObject.shopShippingFees)
    customerOrderObject.orderTotal += parseFloat(shopObject.shopShippingFees)
}


exports.handleOrderCreation = async (customerCartObject, customerOrderObject, isFood, isPurchasing) => {
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
        customerOrderObject.taxesRate = parseFloat(await getSettings("vatRate"))
        customerOrderObject.taxesTotal = 0
        customerOrderObject.shippingFeesTotal = 0
        customerOrderObject.name = customerCartObject.customer.name
        customerOrderObject.phone = customerCartObject.customer.phone
        customerOrderObject.paymentMethod = customerOrderObject.paymentMethod ? customerOrderObject.paymentMethod : "visa"
        customerOrderObject.issueDate = customerOrderObject?.issueDate || customerOrderObject.timestamp
        let subOrders = customerOrderObject.subOrders
        subOrders.forEach((shopObject) => this.addOrderTaxes(shopObject, customerOrderObject, isFood))
        // subOrders.forEach((shopObject) => this.addOrderShippingFees(shopObject, customerOrderObject))

        if (isPurchasing == true) this.calculateCashback(customerCartObject);
        return customerOrderObject

    } catch (err) {
        logInTestEnv("err.message", err.message);
        return {
            success: false,
            code: 500,
            error: err.message
        };
    }
}


exports.handleReverseOrderCreation = (orderObject, subOrderId) => {
    orderObject.name = orderObject.customer.name
    orderObject.phone = orderObject.customer.phone

    let subOrderObject = findObjectInArray(orderObject.subOrders, "_id", subOrderId)
    subOrderObject = subOrderObject.result
    subOrderObject._id = generateSubCartId()
    subOrderObject.name = subOrderObject.shop.nameEn
    subOrderObject.phone = subOrderObject.shop.phone
    subOrderObject.address = subOrderObject.shop.address
    subOrderObject.location = subOrderObject.shop.location
    subOrderObject.status = "to be returned"
    orderObject.subOrders = [subOrderObject]

    return orderObject
}


exports.calculateCashback = async (customerCartObject) => {
    try {
        const settings = await listSettings();
        const cashbackPercentage = settings.result.cashbackPercentage
        logInTestEnv("cashbackPercentage", cashbackPercentage)

        const cashbackThreshold = settings.result.cashbackThreshold
        logInTestEnv("cashbackThreshold", cashbackThreshold)

        const orderTotal = parseInt(customerCartObject?.cartOriginalTotal);
        logInTestEnv("orderTotal", orderTotal)

        const hasPurchasedBefore = customerCartObject?.customer?.hasPurchased || false;
        logInTestEnv("hasPurchasedBefore", hasPurchasedBefore)

        const isCustomerBirthday = this.isDateEqualToToday(customerCartObject?.customer?.birthDate);
        logInTestEnv("isCustomerBirthday", isCustomerBirthday)

        let customerPoints = parseInt(customerCartObject?.customer?.loyaltyPoints) || 0;
        logInTestEnv("customerPoints", customerPoints)

        let customerCashback = parseInt(customerCartObject?.customer?.cashback) || 0;
        logInTestEnv("customerCashback", customerCashback)

        let updateForm = { hasPurchased: hasPurchasedBefore, cashback: customerCashback, loyaltyPoints: customerPoints };
        let newPoints = customerPoints + orderTotal;
        logInTestEnv("newPoints to be added", newPoints)

        if (!hasPurchasedBefore) {
            // First-time purchaser: Apply welcome cashback
            const welcomePercentage = 0.01;
            const welcomeCashback = Math.floor(orderTotal * welcomePercentage);
            logInTestEnv("welcomeCashback", welcomeCashback)

            customerCashback += welcomeCashback;
            logInTestEnv("welcome customerCashback", customerCashback)

            updateForm.hasPurchased = true;
        }

        if (isCustomerBirthday && (newPoints >= parseInt(cashbackThreshold))) {
            // Birthday cashback for eligible customers
            const birthdayPercentage = 0.02;
            const birthdayCashback = Math.floor(orderTotal * birthdayPercentage);
            logInTestEnv("birthdayCashback", birthdayCashback)

            customerCashback += birthdayCashback;
            logInTestEnv("birthday customerCashback", customerCashback)

        }


        // Calculate cashback and update points
        while (newPoints >= parseInt(cashbackThreshold)) {

            logInTestEnv("customerCashback before", customerCashback)
            customerCashback += (Math.floor(parseInt(cashbackThreshold) * parseFloat(cashbackPercentage)) / parseInt(cashbackThreshold));
            logInTestEnv("customerCashback after", customerCashback)

            logInTestEnv("newPoints before", newPoints)
            newPoints -= parseInt(cashbackThreshold);
            logInTestEnv("newPoints after", newPoints)

        }

        updateForm.cashback = customerCashback;
        logInTestEnv("updateForm.cashback", updateForm.cashback)

        updateForm.loyaltyPoints = newPoints;
        logInTestEnv("updateForm.loyaltyPoints", updateForm.loyaltyPoints)


        await customerRepo.updateDirectly(customerCartObject?.customer?._id.toString(), updateForm);
        return updateForm;
    } catch (err) {
        console.error("Error in calculateCashback:", err.message);
        throw err;
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
    logInTestEnv("seller", sellerId);
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