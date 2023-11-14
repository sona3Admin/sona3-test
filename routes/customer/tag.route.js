const app = require("express").Router();
const tagController = require("../../controllers/customer/tag.controller")

app.get("/list", tagController.listTags);
app.get("/get", tagController.getTag);


module.exports = app
