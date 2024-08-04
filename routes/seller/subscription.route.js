const app = require("express").Router();
const subscriptionController = require("../../controllers/seller/subscription.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/subscribe", checkIdentity("_id"), subscriptionController.subscribe);


module.exports = app
