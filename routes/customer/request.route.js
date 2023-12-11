const app = require("express").Router();
const requestController = require("../../controllers/customer/request.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.post("/create", checkIdentity("customer"), requestController.createRequest);
app.put("/update", checkIdentity("customer"), requestController.updateRequest);

app.get("/list", checkIdentity("customer"), requestController.listRequests);
app.get("/get", checkIdentity("customer"), requestController.getRequest);


module.exports = app
