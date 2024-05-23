const { getSettings } = require("./settings.helper")
const customerRepo = require("../modules/Customer/customer.repo")



exports.calculateValueAddedTax = (itemsArray, vatRateNumber) => {
    const vatValue = parseFloat(vatRateNumber / 100)
    if (typeof vatRateNumber !== 'number' || vatRateNumber < 0 || typeof vatValue !== 'number') return 'Invalid input. Please provide a valid array of items and a non-negative VAT rate.'

    let taxesTotal = parseFloat(0);
    const vatAmount = vatValue * parseFloat(itemObject.itemTotal);
    taxesTotal += vatAmount;
    
    return taxesTotal;
}


exports.addOrderTaxes = (shopObject, customerOrderObject) => {
    shopObject.shopTaxes = this.calculateValueAddedTax(shopObject.items, customerOrderObject.taxesRate)
    shopObject.subOrderTotal = parseFloat(shopObject.shopTaxes) + parseFloat(shopObject.shopTotal)
    customerOrderObject.taxesTotal += parseFloat(shopObject.shopTaxes)
    customerOrderObject.orderTotal += parseFloat(customerOrderObject.taxesTotal)

    this.addOrderShippingFees(shopObject, customerOrderObject)
}


exports.addOrderShippingFees = (shopObject, customerOrderObject) => {
    const ifastShippingCost = 15
    shopObject.shopShippingFees = ifastShippingCost
    shopObject.subOrderTotal = parseFloat(shopObject.shopShippingFees) + parseFloat(shopObject.shopTotal)
    customerOrderObject.shippingFeesTotal += parseFloat(shopObject.shopShippingFees)
    customerOrderObject.orderTotal += parseFloat(customerOrderObject.shippingFeesTotal)
}


exports.handleOrderCreation = async (customerCartObject, customerOrderObject) => {
    try {

        customerOrderObject.cartTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.orderTotal = parseFloat(customerCartObject.cartTotal)
        customerOrderObject.cartOriginalTotal = parseFloat(customerCartObject.cartOriginalTotal)

        customerOrderObject.taxesRate = parseFloat(getSettings("vatRate"))
        customerOrderObject.taxesTotal = 0
        customerOrderObject.shippingFeesTotal = 0
        customerOrderObject.name = customerCartObject.customer.name
        customerOrderObject.phone = customerCartObject.customer.phone

        this.addOrderTaxes(shopObject, customerOrderObject)

        return customerOrderObject

    } catch (err) {
        console.log("err.message", err.message);
    }
}

