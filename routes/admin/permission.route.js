const app = require("express").Router();
const permissionController = require("../../controllers/admin/permission.controller")

app.get("/list", permissionController.listPermissions);



module.exports = app
