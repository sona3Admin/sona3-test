const app = require("express").Router();
const stripeController = require("../../mocks/stripe.mock")


app.post("/createOrder", stripeController.intiateStripePayment)



module.exports = app
