const i18n = require('i18n');
const emailHelper = require('../helpers/email.helper');


exports.sendEmailVerificationCode = async (req, res) => {
    try {
        const payloadObject = {
            name: req.body.name,
            email: req.body.email
        };
        const operationResultObject = await emailHelper.sendEmailVerificationCode(payloadObject, req.lang)
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


exports.sendSellerVerificationConfirmation = async (req, res) => {
    try {
        const operationResultObject = await emailHelper.sendSellerVerificationConfirmation(req.body, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.sendShopVerificationConfirmation = async (req, res) => {
    try {
        
        const operationResultObject = await emailHelper.sendShopVerificationConfirmation(req.body, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.sendServiceRequestCreationEmailToCustomer = async (req, res) => {
    try {
        let customerRequestObject = req.body
        const operationResultObject = await emailHelper.sendServiceRequestCreationEmailToCustomer(customerRequestObject, req.lang)
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


exports.sendServiceRequestCreationEmailToSeller = async (req, res) => {
    try {
        let customerRequestObject = req.body
        const operationResultObject = await emailHelper.sendServiceRequestCreationEmailToSeller(customerRequestObject, req.lang)
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


exports.sendPurchaseConfirmationEmailToCustomer = async (req, res) => {
    try {

        let customerOrderObject = req.body
        const operationResultObject = await emailHelper.sendPurchaseConfirmationEmailToCustomer(customerOrderObject, req.lang)
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


exports.sendPurchaseConfirmationEmailToSeller = async (req, res) => {
    try {

        let customerOrderObject = req.body
        const operationResultObject = await emailHelper.sendPurchaseConfirmationEmailToSeller(customerOrderObject, req.lang)
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


