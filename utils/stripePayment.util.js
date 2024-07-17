const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


exports.initiatePayment = async (orderCostObject, customerDetails, orderDetails) => {
    try {
        const cents = 100
        const customerDetailsObject = {
            customer: customerDetails?.customer,
            country: customerDetails?.shippingAddress?.address?.country,
            city: customerDetails?.shippingAddress?.address?.city,
            cityCode: customerDetails?.shippingAddress?.address?.cityCode,
            street: customerDetails?.shippingAddress?.address?.street,
            remarks: customerDetails?.shippingAddress?.address?.remarks,
            long: customerDetails?.shippingAddress?.location?.coordinates[0],
            lat: customerDetails?.shippingAddress?.location?.coordinates[1],
        }
        let orderDetailsObject = {
            ...orderDetails,
            ...customerDetailsObject
        }

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
                        unit_amount: (orderCostObject.shippingFeesTotal) * cents,
                    },
                    quantity: 1,
                }
            ],
            success_url: `${process.env.STRIPE_SUCCESS_URL}`,
            cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
            metadata: { ...orderDetailsObject }
        })
        return { success: true, code: 201, result: session.url }
    } catch (err) {
        console.log("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}


exports.getPaymentSuccessAck = (req, res, next) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderDetails = session.metadata;
            req.body = orderDetails
            console.log("orderDetails", orderDetails)
            return next()
        }

    } catch (err) {
        console.log("err.message", err.message)
        return res.status(400).json({ success: false, code: 400, error: err.message })
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