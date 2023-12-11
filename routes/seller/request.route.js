const app = require("express").Router();
const requestController = require("../../controllers/seller/request.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.put("/update", checkIdentity("seller"), requestController.updateRequest);

app.get("/list", checkIdentity("seller"), requestController.listRequests);
app.get("/get", checkIdentity("seller"), requestController.getRequest);


module.exports = app
