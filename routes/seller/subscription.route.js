const app = require("express").Router();
const subscriptionController = require("../../controllers/seller/subscription.controller")
const tierController = require("../../controllers/seller/tier.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/subscribe", checkIdentity("_id"), subscriptionController.paySubscriptionFees);

app.get("/list", tierController.listTiers);

module.exports = app
