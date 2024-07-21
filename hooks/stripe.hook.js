const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

exports.getPaymentSuccessAck = (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody;
        let event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Event Type after verification:", event.type);

        const session = event.data.object;
        console.log(`Checkout session completed: ${session}`);

        return res.send();
    } catch (err) {
        console.log("err.message", err.message);
        return res.status(400).json({ success: false, code: 400, error: err.message });
    }
};