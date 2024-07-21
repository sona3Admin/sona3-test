const app = require("express").Router();
const stripeController = require("../../hooks/stripe.hook")


app.post("/status", stripeController.getPaymentSuccessAck)


module.exports = app
