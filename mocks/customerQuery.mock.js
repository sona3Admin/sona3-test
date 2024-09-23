const i18n = require('i18n');
const sellerModel = require("../modules/Seller/seller.model")
const customerModel = require("../modules/Customer/customer.model")


exports.executeQuery = async (req, res) => {
    try {
        const operationResultObject = await customerModel.updateMany({}, req.body)
        return res.status(200).json({ success: true, ...operationResultObject });

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}
