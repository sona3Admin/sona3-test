const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


exports.getPaymentSuccessAck = (req, res, next) => {
    try {
        console.log("triggered")
        console.log("req.body", req.body)
        const sig = req.headers['stripe-signature'];
        const rawBody = req.body.toString('utf8');
        let event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        // if (event.type === 'checkout.session.completed' || event.type == "payment_intent.succeeded") {
        const session = event.data.object;
        // const orderDetails = session.metadata;
        // req.body = orderDetails
        // console.log("orderDetails", orderDetails)
        console.log(`Checkout session completed: ${session.id}`);
        console.log("Session", session)
        // return next()
        return res.send()

        // }

    } catch (err) {
        console.log("err.message", err.message)
        return res.status(400).json({ success: false, code: 400, error: err.message })
    }
}