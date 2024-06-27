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
                        unit_amount: orderCostObject.cartTotal,
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Tax",
                        },
                        unit_amount: orderCostObject.taxesTotal,
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Shipping Fee",
                        },
                        unit_amount: orderCostObject.shippingFeesTotal,
                    },
                    quantity: 1,
                }
            ],
            payment_intent_data: {
                application_fee_amount: 100, // Example application fee (in cents)
                transfer_data: {
                    destination: req.body.items[0].sellerAccountId, // Assuming all items belong to the same seller
                },
            },
            metadata: { ...orderDetails }
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