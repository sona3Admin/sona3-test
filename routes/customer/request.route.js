const app = require("express").Router();
const requestController = require("../../controllers/customer/request.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.post("/create", checkIdentity("customer"), requestController.createRequest);
app.post("/purchase", checkIdentity("customer"), requestController.purchaseRequest);
app.delete("/return", checkIdentity("customer"), requestController.returnRequest);
app.patch("/cancel", checkIdentity("customer"), requestController.cancelRequest);

app.put("/update", checkIdentity("customer"), requestController.updateRequest);

app.get("/list", checkIdentity("customer"), requestController.listRequests);
app.get("/listCart", checkIdentity("customer"), requestController.listPendingAndAcceptedRequests);
app.get("/listProfile", checkIdentity("customer"), requestController.listCanceledAndRejectedRequests);
app.get("/get", checkIdentity("customer"), requestController.getRequest);

app.post("/shipping", checkIdentity("customer"), requestController.calculateRequestShippingCost)
app.get("/status", checkIdentity("customer"), requestController.getOrderShipmentLastStatus)

module.exports = app
