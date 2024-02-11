const app = require("express").Router();
const basketController = require("../../controllers/admin/basket.controller")

app.get("/get", basketController.getBasket);
app.get("/list", basketController.listBaskets);

app.put("/update", basketController.updateBasket);
app.delete("/remove", basketController.removeBasket);



module.exports = app
