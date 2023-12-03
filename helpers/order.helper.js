
const { getSettings } = require("./settings.helper")


function calculateValueAddedTax(itemsArray) {
    const vatRateNumber = parseFloat(getSettings("vatRate"))
    const vatValue = parseFloat(vatRateNumber / 100)
    if (typeof vatRateNumber !== 'number' || vatRateNumber < 0 || typeof vatValue !== 'number')
        return 'Invalid input. Please provide a valid array of items and a non-negative VAT rate.'

    let taxesTotal = parseFloat(0);

    itemsArray.forEach(itemObject => {
        const vatAmount = vatValue * parseFloat(itemObject.itemTotal);
        taxesTotal += vatAmount;
    });

    return taxesTotal;
}


module.exports = [
    calculateValueAddedTax
]