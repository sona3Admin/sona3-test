const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);


exports.getPaymentSuccessAck = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody;
        let event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Event Type after verification:", event.type);

        if (event.type === 'checkout.session.completed' || event.type == 'payment_intent.created') {
            const session = event.data.object;
            console.log(`Checkout session completed: ${session.id}`);

            return res.send()
        }

        return res.send()
    } catch (err) {
        console.log("err.message", err.message);
        return res.status(400).json({ success: false, code: 400, error: err.message });
    }
};