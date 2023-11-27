const app = require("express").Router();
const cartController = require("../../controllers/admin/cart.controller")

app.get("/get", cartController.getCart);
app.get("/list", cartController.listCarts);

app.put("/update", cartController.updateCart);
app.delete("/remove", cartController.removeCart);



module.exports = app
