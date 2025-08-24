const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const paymentRepo = require("../modules/Payment/payment.repo")
const { logInTestEnv } = require("../helpers/logger.helper");


const URLS = {
    test: {
        seller: {
            web: {
                success: "https://seller-web-test.vercel.app/payment_succeed",
                cancel: "https://seller-web-test.vercel.app/payment_failed"
            },
            mobile: {
                success: "https://seller-web-test.vercel.app/mobile_payment_succeed",
                cancel: "https://seller-web-test.vercel.app/mobile_payment_failed"
            }
        },
        customer: {
            web: {
                success: "https://customer-web-flame.vercel.app/payment_succeed",
                cancel: "https://customer-web-flame.vercel.app/payment_failed"
            },
            mobile: {
                success: "https://customer-web-flame.vercel.app/mobile_payment_succeed",
                cancel: "https://customer-web-flame.vercel.app/mobile_payment_failed"
            }
        }
    },
    development: {
        seller: {
            web: {
                success: "https://seller.sona3.ae/payment_succeed",
                cancel: "https://seller.sona3.ae/payment_failed"
            },
            mobile: {
                success: "https://seller.sona3.ae/mobile_payment_succeed",
                cancel: "https://seller.sona3.ae/mobile_payment_failed"
            }
        },
        customer: {
            web: {
                success: "https://shop.sona3.ae/payment_succeed",
                cancel: "https://shop.sona3.ae/payment_failed"
            },
            mobile: {
                success: "https://shop.sona3.ae/mobile_payment_succeed",
                cancel: "https://shop.sona3.ae/mobile_payment_failed"
            }
        }
    }
}


function getUrls(userType, agent = 'web', lang) {
    const env = process.env.CURRENT_ENV === 'test' ? 'test' : 'development'
    const deviceType = agent === 'mobile' ? 'mobile' : 'web'
    let url = URLS[env][userType][deviceType]
    url.success = `${url.success}?lang=${lang}`
    url.cancel = `${url.cancel}?lang=${lang}`
    return url
}


exports.initiateOrderPayment = async (orderCostObject, customerDetails, orderDetails, orderType, timestamp, agent, lang) => {
    try {
        const cents = 100
        const reqLang = lang || "en"
        const urls = getUrls('customer', agent, reqLang)
        const successUrl = urls.success
        const cancelUrl = urls.cancel
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
                        unit_amount: parseInt((orderCostObject.cartTotal) * cents),
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Tax",
                        },
                        unit_amount: parseInt((orderCostObject.taxesTotal) * cents),
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Shipping Fee",
                        },
                        unit_amount: parseInt((orderCostObject?.shippingFeesTotal) * cents) || 0,
                    },
                    quantity: 1,
                }
            ],
            success_url: successUrl,
            cancel_url: cancelUrl
        })

        if (!session.id) return { success: false, code: 500, error: "Failed to create session" }

        const paymentObject = {
            session: session.id,
            customer: customerDetails.customer,
            shippingAddress: customerDetails?.shippingAddress,
            shippingCost: customerDetails?.shippingCost,
            orderCost: orderCostObject,
            orderDetails,
            orderType,
            timestamp,
            lang,
        }

        logInTestEnv("paymentObject", paymentObject)
        paymentRepo.create(paymentObject)
        return { success: true, code: 201, result: session.url }
    } catch (err) {
        logInTestEnv("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}


exports.initiateSubscriptionPayment = async (sellerId, tierName, tierDuration, subscriptionFees, initialFees, payedInitialFees, timestamp, agent, lang) => {
    try {
        const cents = 100
        let paymentObject = {};
        if (!initialFees) initialFees = 0
        logInTestEnv("subscriptionFees in stripe", subscriptionFees)
        logInTestEnv("initialFees in stripe", initialFees)
        const reqLang = lang || "en"
        const urls = getUrls('seller', agent, reqLang)
        logInTestEnv("urls", urls)

        const successUrl = urls.success
        const cancelUrl = urls.cancel

        let sessionObject = {
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                // {
                //     price_data: {
                //         currency: "aed",
                //         product_data: {
                //             name: `Subscription Fees for ${tierName} plan`,
                //         },
                //         unit_amount: parseInt(parseFloat(subscriptionFees) * cents),
                //     },
                //     quantity: 1,
                // }
            ],
            success_url: successUrl,
            cancel_url: cancelUrl
        }

        logInTestEnv("Session Object ready")
        if (initialFees > 0) {
            sessionObject.line_items.push({
                price_data: {
                    currency: "aed",
                    product_data: {
                        name: `Initial Fees`,
                    },
                    unit_amount: parseInt(parseFloat(initialFees) * cents),
                },
                quantity: 1,
            })
            logInTestEnv("initialFees ready")
        }

        const session = await stripe.checkout.sessions.create(sessionObject)
        logInTestEnv("Session Created")
        if (!session.id) return { success: false, code: 500, error: "Failed to create session" }

        paymentObject = {
            session: session.id,
            seller: sellerId,
            tier: tierName,
            tierDuration: tierDuration,
            subscriptionFees: parseFloat(subscriptionFees) + parseFloat(initialFees),
            freeTrialApplied: ((subscriptionFees == 0) ? true : false),
            orderType: "subscription",
            timestamp,
            payedInitialFees
        }
        // if (initialFees > 0) paymentObject["payedInitialFees"] = true
        logInTestEnv("paymentObject", paymentObject)
        paymentRepo.create(paymentObject)
        return { success: true, code: 201, result: session.url }
    } catch (err) {
        logInTestEnv("err", err.message)
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
        logInTestEnv("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}