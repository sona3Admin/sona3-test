const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo")
const stripeHelper = require("../../utils/stripePayment.util")
const { getTeirs } = require("../../helpers/teirs.helper")
const { getSettings } = require("../../helpers/settings.helper")


exports.subscribe = async (req, res) => {
    try {
        const todayDate = new Date();
        const freeTrialEndDate = new Date('2025-01-01');
        let initialFees = 0
        const freeTrialOn = await getSettings("isFreeTrialOn")
        console.log("freeTrialOn", freeTrialOn)
        const sellerObject = await sellerRepo.find({ _id: req.query._id })
        if (!sellerObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") })

        if (sellerObject.result.isSubscribed &&
            sellerObject.result.subscriptionEndDate < todayDate &&
            sellerObject.result.tier == req.query.teir) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("alreadySubscribedToPlan")
            })
        }

        if (sellerObject.result.isSubscribed &&
            sellerObject.result.subscriptionEndDate < todayDate &&
            sellerObject.result.tier != req.query.teir) {
            // calculate remaining credit and upgrade to the new higher teir
        }

        const teirDetails = await getTeirs(`${req.query.teir}_${sellerObject.result.type}`)
        let subscriptionFees = req.query.teirDuration == "month" ? parseFloat(teirDetails.monthlyFees) : parseFloat(teirDetails.yearlyFees)

        if (!sellerObject.result.payedInitialFees) initialFees += parseFloat(teirDetails.initialFees)
        if ((todayDate < freeTrialEndDate) && freeTrialOn) subscriptionFees = 0

        let operationResultObject = await stripeHelper.initiateSubscriptionPayment(req.query._id, req.query.teir, subscriptionFees, initialFees)
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


exports.handleFreeTrial = async (req, res, sellerObject) => {
    try {

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}