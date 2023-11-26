const app = require("express").Router();
const wishlistController = require("../../controllers/customer/wishlist.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")

app.get("/get", checkIdentity("customer"), wishlistController.getWishlist);

app.post("/item", checkIdentity("customer"), wishlistController.addItemToWishlist);
app.delete("/item", checkIdentity("customer"), wishlistController.removeItemFromWishlist);



module.exports = app
