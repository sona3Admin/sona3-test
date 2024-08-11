const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const paymentRepo = require("../modules/Payment/payment.repo")


exports.initiateOrderPayment = async (orderCostObject, customerDetails, orderDetails, orderType, timestamp) => {
    try {
        const cents = 100

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Items Total",
                        },
                        unit_amount: (orderCostObject.cartTotal) * cents,
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Tax",
                        },
                        unit_amount: (orderCostObject.taxesTotal) * cents,
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Shipping Fee",
                        },
                        unit_amount: (orderCostObject?.shippingFeesTotal) * cents || 0,
                    },
                    quantity: 1,
                }
            ],
            success_url: `${process.env.STRIPE_SUCCESS_URL}`,
            cancel_url: `${process.env.STRIPE_CANCEL_URL}`
        })

        if (!session.id) return { success: false, code: 500, error: err.message }

        const paymentObject = {
            session: session.id,
            customer: customerDetails.customer,
            shippingAddress: customerDetails?.shippingAddress,
            shippingCost: customerDetails?.shippingCost,
            orderCost: orderCostObject,
            orderDetails,
            orderType,
            timestamp
        }

        paymentRepo.create(paymentObject)
        return { success: true, code: 201, result: session.url }
    } catch (err) {
        console.log("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}


exports.initiateSubscriptionPayment = async (sellerId, tierName, tierDuration, subscriptionFees, initialFees, timestamp) => {
    try {
        const cents = 100
        let paymentObject = {};
        if (!initialFees) initialFees = 0
        console.log("subscriptionFees in stripe", subscriptionFees)
        let sessionObject = {
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: `Subscription Fees for ${tierName} plan`,
                        },
                        unit_amount: parseFloat(subscriptionFees) * cents,
                    },
                    quantity: 1,
                }
            ],
            success_url: `${process.env.STRIPE_SUCCESS_URL}`,
            cancel_url: `${process.env.STRIPE_CANCEL_URL}`
        }
        console.log("Session Object ready")
        if (initialFees > 0) {
            sessionObject.line_items.push({
                price_data: {
                    currency: "aed",
                    product_data: {
                        name: `Initial Subscription Fees`,
                    },
                    unit_amount: parseFloat(initialFees) * cents,
                },
                quantity: 1,
            })
            console.log("initialFees ready")

        }

        const session = await stripe.checkout.sessions.create(sessionObject)
        console.log("Session Created")
        if (!session.id) return { success: false, code: 500, error: err.message }

        paymentObject = {
            session: session.id,
            seller: sellerId,
            tier: tierName,
            tierDuration: tierDuration,
            subscriptionFees: subscriptionFees + initialFees,
            freeTrialApplied: ((subscriptionFees == 0) ? true : false),
            orderType: "subscription",
            timestamp
        }
        if(initialFees > 0) paymentObject["payedInitialFees"] = true

        paymentRepo.create(paymentObject)
        return { success: true, code: 201, result: session.url }
    } catch (err) {
        console.log("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}


exports.refundToCustomer = async (amount, paymentIntentId, sessionId) => {
    try {

        // Retrieve the Checkout Session to get the payment intent ID
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session.payment_intent) return { success: false, code: 400, error: 'No payment intent found for this session.' };

        const paymentIntentId = session.payment_intent;

        // Fetch the payment intent to get payment details
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Calculate the amount to be refunded, if it's partial or full
        const refundAmount = amount || paymentIntent.amount_received;

        // Create a refund
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount,
            reason: 'requested_by_customer',
        });

        return { success: true, code: 201, result: refund }
    } catch (err) {
        console.log("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}