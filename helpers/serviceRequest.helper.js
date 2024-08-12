const { getSettings } = require("./settings.helper")
const { generateSubCartId } = require("./cart.helper")


exports.calculateValueAddedTax = (serviceTotal) => {
    let vatRateNumber = parseFloat(getSettings("vatRate"))
    const vatValue = parseFloat(vatRateNumber / 100)
    if (typeof vatRateNumber !== 'number' || vatRateNumber < 0 || typeof vatValue !== 'number') return 'Invalid input. Please provide a valid array of items and a non-negative VAT rate.'

    let taxesTotal = parseFloat(0);

    const vatAmount = vatValue * parseFloat(serviceTotal);
    taxesTotal += vatAmount;

    return taxesTotal;
}


exports.handleRequestPurchase = async (customerRequestObject, customerOrderObject) => {
    try {
        customerRequestObject.name = customerRequestObject.customer.name
        customerRequestObject.phone = customerRequestObject.customer.phone
        customerRequestObject.taxesTotal = this.calculateValueAddedTax(customerRequestObject.serviceTotal)
        customerRequestObject.taxesRate = parseFloat(getSettings("vatRate"))
        customerRequestObject.orderTotal = parseFloat(customerRequestObject.serviceTotal) + parseFloat(customerRequestObject.taxesTotal)
        customerRequestObject.paymentMethod = customerOrderObject.paymentMethod ? customerOrderObject.paymentMethod : "visa"
        console.log("customerRequestObject.paymentMethod", customerRequestObject.paymentMethod)
        customerRequestObject.requestDate = customerOrderObject?.requestDate || customerOrderObject.timestamp
        customerRequestObject.calculations = {
            taxesTotal: customerRequestObject.taxesTotal,
            taxesRate: customerRequestObject.taxesRate,
            orderTotal: customerRequestObject.orderTotal,
            status: "purchased",
            paymentMethod: customerRequestObject.paymentMethod
        }
        return customerRequestObject
    } catch (err) {
        console.log("err.message", err.message);
    }
}


exports.handleReturnService = (customerRequestObject, subOrderId) => {
    customerRequestObject.name = customerRequestObject.customer.name
    customerRequestObject.phone = customerRequestObject.customer.phone
    customerRequestObject.shipperRef = generateSubCartId()
    customerRequestObject.status = "to be returned"
    customerRequestObject.calculations = {
        shipperRef: customerRequestObject.shipperRef,
        status: "to be returned"
    }
    return customerRequestObject
}
