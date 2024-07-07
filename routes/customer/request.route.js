const app = require("express").Router();
const requestController = require("../../controllers/customer/request.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.post("/create", checkIdentity("customer"), requestController.createRequest);
app.post("/purchase", checkIdentity("customer"), requestController.purchaseRequest);
app.delete("/return", checkIdentity("customer"), requestController.returnRequest);
app.patch("/cancel", checkIdentity("customer"), requestController.cancelRequest);

app.put("/update", checkIdentity("customer"), requestController.updateRequest);

app.get("/list", checkIdentity("customer"), requestController.listRequests);
app.get("/get", checkIdentity("customer"), requestController.getRequest);

app.post("/shipping", checkIdentity("customer"), requestController.calculateRequestShippingCost)

module.exports = app
