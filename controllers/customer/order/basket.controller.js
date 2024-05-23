const i18n = require('i18n');
const orderRepo = require("../../../modules/Order/order.repo")
const basketRepo = require("../../../modules/Basket/basket.repo");
const { handleOrderCreation } = require("../../../helpers/order.helper")
const ifastShipperHelper = require("../../../utils/ifastShipping.util")


exports.createOrder = async (req, res) => {
    try {
        let customerOrderObject = req.body
        let customerCartObject = await basketRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject)
        const operationResultObject = await orderRepo.create(customerOrderObject);
        let shippingData = await ifastShipperHelper.createNewBulkOrder(customerOrderObject)
        operationResultObject["orderData"] = shippingData.orderData
        // basketRepo.flush({ customer: req.body.customer })
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}
