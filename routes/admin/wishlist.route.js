const app = require("express").Router();
const wishlistController = require("../../controllers/admin/wishlist.controller")

app.get("/get", wishlistController.getWishlist);
app.get("/list", wishlistController.listWishlists);

app.put("/update", wishlistController.updateWishlist);
app.delete("/remove", wishlistController.removeWishlist);



module.exports = app
