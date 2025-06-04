const i18n = require('i18n');
const sellerRepo = require("../../../modules/Seller/seller.repo")
const shopRepo = require('../../../modules/Shop/shop.repo');
const productRepo = require('../../../modules/Product/product.repo');
const orderRepo = require("../../../modules/Order/order.repo")
const cartRepo = require("../../../modules/Cart/cart.repo");
const { handleOrderCreation } = require("../../../helpers/order.helper")
const firstFlightShipperHelper = require("../../../utils/firstFlightSipping.util")
const stripeHelper = require("../../../utils/stripePayment.util");
const { sendOrderPurchaseConfirmationEmailToCustomer, sendOrderPurchaseConfirmationEmailToSeller } = require('../../../helpers/email.helper');
const { logInTestEnv } = require("../../../helpers/logger.helper");
const customerRepo = require("../../../modules/Customer/customer.repo");

exports.createOrder = async (req, res) => {
    try {
        logInTestEnv("req.body.paymentMethod", req.body.paymentMethod)
        if (req.body?.paymentMethod == "visa") return await this.createOrderPaymentLink(req, res)

        let customerOrderObject = req.body
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        const customer = await customerRepo.get({ _id: req.body.customer }, {});
        if (!customer.success) return res.status(customer.code).json(customer);
        const customerAddresses = customer.result.addresses || [];
        if (req.body.shippingAddress) {
            const shippingAddress = customerAddresses.find(address => address._id.toString() === req.body.shippingAddress.toString());
            if (!shippingAddress) {
                return res.status(400).json({ success: false, code: 400, error: i18n.__("notFound") });
            }
            if (!shippingAddress.location || !shippingAddress.country || !shippingAddress.city || !shippingAddress.street) {
                return res.status(400).json({ success: false, code: 400, error: i18n.__("notFound") });
            }
            
            req.body.shippingAddress = {
                location: shippingAddress.location,
                address: {
                    country: shippingAddress.country,
                    city: {
                        CityCode: shippingAddress.city.CityCode,
                        CityName: shippingAddress.city.CityName,
                        CountryCode: shippingAddress.city.CountryCode,
                        CountryName: shippingAddress.city.CountryName,
                        State: shippingAddress.city.State,
                    },
                    street: shippingAddress.street,
                    remarks: shippingAddress.remarks? shippingAddress.remarks : ""
                }
            }
            customerOrderObject.shippingAddress = req.body.shippingAddress;
        }

        const customerDetailsObject = customerCartObject.result.customer

        const hasInactiveProductOrVariation = customerCartObject.result.subCarts.some(subCart => {
            return subCart.items.some(item => {
                const productIsActive = item.product?.isActive;
                const variationIsActive = item.variation?.isActive;

                return productIsActive === false || variationIsActive === false;
            });
        });

        if (hasInactiveProductOrVariation) {
            return res.status(400).json({ success: false, code: 400, error: i18n.__("notActiveProduct") });
        }        

        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, false, true)
        customerOrderObject["orderType"] = "cart";
        let operationResultObject = await orderRepo.create(customerOrderObject);
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        let shippingData = await firstFlightShipperHelper.createNewBulkOrder(customerOrderObject, false)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject = await firstFlightShipperHelper.saveShipmentData(shippingData.result, operationResultObject.result, customerOrderObject.shippingCost)
        logInTestEnv("Saved Shipment Data")
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        cartRepo.flush({ customer: req.body.customer })
        sellerRepo.updateManyById(operationResultObject.result.sellers, { hasSold: true })
        shopRepo.updateManyById(operationResultObject.result.shops, { $inc: { orderCount: 1 }, hasSold: true })
        productRepo.updateManyById(operationResultObject.result.products, { $inc: { orderCount: 1 } })
        operationResultObject.result = operationResultObject.result.toObject()
        operationResultObject.result.customer = { ...customerDetailsObject }
        sendOrderPurchaseConfirmationEmailToCustomer(operationResultObject.result, req.lang)
        sendConfirmationEmailsToSellers(operationResultObject.result, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);

    }
    catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.createOrderPaymentLink = async (req, res) => {
    try {
        let customerOrderObject = req.body
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, false, false)
        let customerDetailsObject = { ...req.body }
        let costObject = { cartTotal: customerOrderObject.cartTotal, taxesTotal: customerOrderObject.taxesTotal, shippingFeesTotal: customerDetailsObject.shippingCost.total }
        let orderDetailsObject = { cart: customerCartObject.result._id.toString() }
        const orderType = "cart"
        let agent = req.query.agent || "web"
        let operationResultObject = await stripeHelper.initiateOrderPayment(costObject, customerDetailsObject, orderDetailsObject, orderType, req.body.issueDate, agent, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


async function sendConfirmationEmailsToSellers(orderDetails, lang) {
    orderDetails.subOrders.forEach(async (subOrderDetails) => {
        try {
            let shopData = await shopRepo.getWithSeller({ _id: subOrderDetails.shop.toString() }, { nameEn: 1, nameAr: 1 });
            if (shopData.success) {
                const subOrderData = {
                    _id: orderDetails._id.toString(),
                    customer: orderDetails.customer,
                    seller: shopData.result.seller,
                    shop: { nameEn: shopData.result.nameEn, nameAr: shopData.result.nameAr },
                    paymentMethod: orderDetails.paymentMethod,
                    shopTotal: subOrderDetails.shopTotal,
                    shopTaxes: subOrderDetails.shopTaxes,
                    taxesRate: orderDetails.taxesRate,
                    shopShippingFees: subOrderDetails.shopShippingFees,
                    orderTotal: subOrderDetails.subOrderTotal
                }
                sendOrderPurchaseConfirmationEmailToSeller(subOrderData, lang);
            }

        } catch (err) {
            console.error(`Failed to send confirmation email to seller with ID ${subOrderDetails}:`, err.message);
        }
    });
}