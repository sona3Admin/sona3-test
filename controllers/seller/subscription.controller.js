const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo")
const couponRepo = require("../../modules/Coupon/coupon.repo")
const stripeHelper = require("../../utils/stripePayment.util")
const { getTiers } = require("../../helpers/tiers.helper")
const { getSettings } = require("../../helpers/settings.helper")


exports.paySubscriptionFees = async (req, res) => {
    try {
        console.log("Intiating Subscription Flow...")
        const todayDate = new Date();
        const freeTrialEndDate = new Date('2025-01-01');
        let initialFees = 0
        const freeTrialOn = await getSettings("isFreeTrialOn")
        console.log("req.query.tier", req.query.tier)
        console.log("req.query.tierDuration", req.query.tierDuration)
        console.log("freeTrialOn", freeTrialOn)

        const sellerObject = await sellerRepo.find({ _id: req.query._id })
        if (!sellerObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") })
        console.log("sellerObject.result.isSubscribed", sellerObject.result.isSubscribed)
        console.log("sellerObject.result.tier", sellerObject.result.tier)
        console.log("sellerObject.result.tierDuration", sellerObject.result.tierDuration)
        console.log("sellerObject.result.subscriptionStartDate", sellerObject.result.subscriptionStartDate)
        console.log("sellerObject.result.subscriptionEndDate", sellerObject.result.subscriptionEndDate)

        if (sellerObject.result.isSubscribed &&
            sellerObject.result.subscriptionEndDate > todayDate &&
            sellerObject.result.tier == req.query.tier &&
            sellerObject.result.tierDuration == req.query.tierDuration) return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("alreadySubscribedToPlan")
            })


        const tierDetails = await getTiers(`${req.query.tier}_${sellerObject.result.type}`)

        let subscriptionFees = req.query.tierDuration == "month" ? parseFloat(tierDetails.monthlyFees) : parseFloat(tierDetails.yearlyFees)
        console.log("subscriptionFees", subscriptionFees)

        if (!sellerObject.result.payedInitialFees) initialFees += parseFloat(tierDetails.initialFees)
        console.log("initialFees", initialFees)

        // changing tiers within an active subscription period.
        if (sellerObject.result.isSubscribed &&
            sellerObject.result.subscriptionEndDate > todayDate &&
            (
                (sellerObject.result.tier != req.query.tier) ||
                (sellerObject.result.tierDuration === 'month' && req.query.tierDuration === 'year')
            )
        ) {
            let upgradeResult = await this.upgradeTier(sellerObject, req.query)
            if (!upgradeResult.success) return res.status(upgradeResult.code).json(upgradeResult);
            subscriptionFees = (upgradeResult.result).toFixed(2)
        }

        if (req.query.coupon) {
            let applyingCouponResult = await couponRepo.applyOnSubscriptionFees(req.query.coupon, req.query._id, subscriptionFees)
            if (!applyingCouponResult.success) return res.status(applyingCouponResult.code).json(applyingCouponResult);
            subscriptionFees = (applyingCouponResult.result).toFixed(2)
        }

        if ((todayDate < freeTrialEndDate) && freeTrialOn) subscriptionFees = 0

        console.log("Final Subscription Fees", subscriptionFees)
        console.log("Calculation done, Redirecting to stripe...")
        let operationResultObject = await stripeHelper.initiateSubscriptionPayment(req.query._id, req.query.tier, req.query.tierDuration, subscriptionFees, initialFees)
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


exports.upgradeTier = async (sellerObject, newTierObject) => {
    console.log("Upgrading Tier...")
    const tiers = ['basic', 'pro', 'advanced', 'lifetime'];
    const currentTierIndex = tiers.indexOf(sellerObject.result.tier);
    const newTierIndex = tiers.indexOf(newTierObject.tier);
    const todayDate = new Date();

    // Check if it's a downgrade
    if (newTierIndex < currentTierIndex) return {
        success: false,
        code: 400,
        error: i18n.__("cannotDowngradeTier")
    };


    // Calculate remaining time in current subscription
    const currentTotalSubscriptionDuration = sellerObject.result.tierDuration === 'month' ? 30 : 365; // days
    console.log("currentTotalSubscriptionDuration", currentTotalSubscriptionDuration)

    const timeSpent = (todayDate - sellerObject.result.subscriptionStartDate) / (1000 * 60 * 60 * 24); // in days
    console.log("timeSpent", timeSpent)

    const timeRemaining = currentTotalSubscriptionDuration - timeSpent;
    console.log("timeRemaining", timeRemaining)

    const percentageRemaining = timeRemaining / currentTotalSubscriptionDuration;
    console.log("percentageRemaining", percentageRemaining)

    // Get current tier details
    const currentTierDetails = await getTiers(`${sellerObject.result.tier}_${sellerObject.result.type}`);
    const currentTierFees = sellerObject.result.tierDuration === 'month' ?
        parseFloat(currentTierDetails.monthlyFees) : parseFloat(currentTierDetails.yearlyFees);
    console.log("currentTierFees", currentTierFees)

    // Calculate remaining credit
    const remainingCredit = currentTierFees * percentageRemaining;
    console.log("remainingCredit", remainingCredit)

    // Calculate new tier fees
    const newTierDetails = await getTiers(`${newTierObject.tier}_${sellerObject.result.type}`);
    let newSubscriptionFees = newTierObject.tierDuration === 'month' ?
        parseFloat(newTierDetails.monthlyFees) : parseFloat(newTierDetails.yearlyFees);
    console.log("newSubscriptionFees", newSubscriptionFees)


    // Handle duration upgrade (monthly to yearly) within the same tier
    if (newTierIndex === currentTierIndex &&
        sellerObject.result.tierDuration === 'month' &&
        newTierObject.tierDuration === 'year') {
        console.log("Upgrading from monthly to yearly plan...")
        // Calculate the prorated yearly fee
        const yearlyFee = parseFloat(newTierDetails.yearlyFees);
        console.log("yearlyFee", yearlyFee)

        const proratedYearlyFee = yearlyFee - remainingCredit;
        console.log("proratedYearlyFee", proratedYearlyFee)

        newSubscriptionFees = proratedYearlyFee;
        console.log("newSubscriptionFees", newSubscriptionFees)
        return {
            success: true,
            code: 200,
            result: newSubscriptionFees
        };

    }

    // For tier upgrades or staying on the same plan, subtract remaining credit
    newSubscriptionFees = Math.max(0, (newSubscriptionFees - remainingCredit));
    console.log("newSubscriptionFees", newSubscriptionFees)

    return {
        success: true,
        code: 200,
        result: newSubscriptionFees
    };
};


exports.applySubscription = async (req, res) => {
    try {
        // isSubscribed = true, sart date, end date,
    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}

