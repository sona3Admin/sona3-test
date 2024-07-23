const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const paymentRepo = require("../modules/Payment/payment.repo")
const basketController = require("../controllers/customer/order/basket.controller")
const cartController = require("../controllers/customer/order/cart.controller")
const serviceRequestController = require("../controllers/customer/request.controller")


exports.getPaymentSuccessAck = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody;
        let event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Event Type after verification:", event.type);

        if (event.type === 'checkout.session.completed' || event.type == 'payment_intent.created') {
            const session = event.data.object;
            console.log(`Checkout session completed: ${session.id}`);
            let paymentObject = await paymentRepo.find({ session: session.id })
            req.body = { ...paymentObject.result }
            
            if (paymentObject.result.orderType == "basket") return basketController.createOrder(req, res)
            if (paymentObject.result.orderType == "cart") return cartController.createOrder(req, res)
            if (paymentObject.result.orderType == "request") return serviceRequestController.purchaseRequest(req, res)

            // return res.send()
        }

        return res.send()
    } catch (err) {
        console.log("err.message", err.message);
        return res.status(400).json({ success: false, code: 400, error: err.message });
    }
};