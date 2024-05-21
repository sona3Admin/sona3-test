const app = require("express").Router();
const ifastController = require("../../mocks/ifast.mock")


app.get("/token", ifastController.getIfastToken);
app.post("/createOrder", ifastController.createNewBulkOrder)


module.exports = app
