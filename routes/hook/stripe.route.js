const app = require("express").Router();
const stripeController = require("../../hooks/stripe.hook")
const bodyParser = require("body-parser");

app.post("/status", bodyParser.raw({ type: 'application/json' }), stripeController.getPaymentSuccessAck)


module.exports = app
