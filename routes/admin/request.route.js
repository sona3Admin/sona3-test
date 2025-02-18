const app = require("express").Router();
const requestController = require("../../controllers/admin/request.controller")


app.put("/update", requestController.updateRequest);

app.get("/list", requestController.listRequests);
app.get("/get", requestController.getRequest);


module.exports = app
