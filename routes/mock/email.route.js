const app = require("express").Router();
const emailController = require("../../mocks/email.mock")


app.post("/otp", emailController.sendEmailVerificationCode)
app.post("/sellerVerified", emailController.sendSellerVerificationConfirmation)
app.post("/shopVerified", emailController.sendShopVerificationConfirmation)
app.post("/customerRequestCreated", emailController.sendServiceRequestCreationEmailToCustomer)
app.post("/sellerRequestCreated", emailController.sendServiceRequestCreationEmailToSeller)
app.post("/customerRequestPurchased", emailController.sendPurchaseConfirmationEmailToCustomer)
app.post("/sellerRequestPurchased", emailController.sendPurchaseConfirmationEmailToSeller)
app.post("/customerOrderPurchased", emailController.sendOrderPurchaseConfirmationEmailToCustomer)
app.post("/sellerOrderPurchased", emailController.sendOrderPurchaseConfirmationEmailToSeller)


module.exports = app
