const app = require("express").Router();
const settingController = require("../../controllers/admin/setting.controller")


app.put("/update", settingController.updateSetting);

app.get("/list", settingController.listSettings);
app.get("/tiers", settingController.listTiers);


module.exports = app
