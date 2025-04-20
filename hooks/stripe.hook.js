const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const paymentRepo = require("../modules/Payment/payment.repo")
const basketController = require("../controllers/customer/order/basket.controller")
const cartController = require("../controllers/customer/order/cart.controller")
const serviceRequestController = require("../controllers/customer/request.controller")
const subscriptionController = require("../controllers/seller/subscription.controller")
const { logInTestEnv } = require("../helpers/logger.helper");


exports.getPaymentSuccessAck = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody;
        let event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        logInTestEnv("Event Type after verification:", event.type);

        if (event.type === 'checkout.session.completed' || event.type == 'payment_intent.created') {
            const session = event.data.object;
            logInTestEnv(`Checkout session completed: ${session.id}`);
            let paymentObject = await paymentRepo.find({ session: session.id })
            logInTestEnv("paymentObject in payment ack", paymentObject)
            req.body = { ...paymentObject.result }
            req.headers['accept-language'] = req.body.lang
            req.lang = req.body.lang
            logInTestEnv("req.body {payment object}", req.body)
            if (paymentObject.result.orderType == "basket") return basketController.createOrder(req, res)
            else if (paymentObject.result.orderType == "cart") return cartController.createOrder(req, res)
            else if (paymentObject.result.orderType == "request") return serviceRequestController.purchaseRequest(req, res)
            else if (paymentObject.result.orderType == "subscription") return subscriptionController.applySubscription(req, res)

            // return res.send()
        }

        return res.send()
    } catch (err) {
        logInTestEnv("err.message", err.message);
        return res.status(400).json({ success: false, code: 400, error: err.message });
    }
};