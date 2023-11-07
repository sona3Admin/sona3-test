const app = require("express").Router();
const roleController = require("../../controllers/admin/role.controller")
const { createRoleValidation, updateRoleValidation } = require("../../validations/role.validation")
const validator = require("../../helpers/validation.helper")


app.post("/create", validator(createRoleValidation), roleController.createRole);
app.put("/update", validator(updateRoleValidation), roleController.updateRole);
app.delete("/remove", roleController.removeRole);

app.get("/list", roleController.listRoles);
app.get("/get", roleController.getRole);



module.exports = app
