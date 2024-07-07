const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


exports.createConnectedAccount = async () => {
    try {
        const account = await stripe.accounts.create({ type: 'express' });
        return { success: true, code: 201, result: account.id };
    } catch (err) {
        console.error("Error creating connected account:", err);
        return { success: false, code: 500, error: err.message };
    }
};


exports.initiatePayment = async (orderCostObject, orderDetails) => {
    try {
        const cents = 100
        const orderDetailsObject = {
            customer: orderDetails.customer,
            country: orderDetails.shippingAddress.address.country,
            city: orderDetails.shippingAddress.address.city,
            street: orderDetails.shippingAddress.address.street,
            remarks: orderDetails.shippingAddress.address.remarks,
            long: orderDetails.shippingAddress.location.coordinates[0],
            lat: orderDetails.shippingAddress.location.coordinates[1],
        }

        const ephemeralKey = await stripe.ephemeralKeys.create({ apiVersion: '2024-06-20' });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: (orderCostObject.orderTotal) * cents,
            currency: 'aed',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: { ...orderDetailsObject }
        });

        return {
            success: true, code: 201, 
            result: {
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
            }
        }
    } catch (err) {
        console.log("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}


exports.initiatePayment = async (orderCostObject, orderDetails) => {
    try {
        const cents = 100
        const orderDetailsObject = {
            customer: orderDetails.customer,
            country: orderDetails.shippingAddress.address.country,
            city: orderDetails.shippingAddress.address.city,
            street: orderDetails.shippingAddress.address.street,
            remarks: orderDetails.shippingAddress.address.remarks,
            long: orderDetails.shippingAddress.location.coordinates[0],
            lat: orderDetails.shippingAddress.location.coordinates[1],
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


exports.refundToCustomer = async (amount, paymentIntentId) => {
    try{
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount,
        });
        return { success: true, code: 201, result: refund }

    } catch (err) {
        console.log("err", err.message)
        return { success: false, code: 500, error: err.message }
    }
}