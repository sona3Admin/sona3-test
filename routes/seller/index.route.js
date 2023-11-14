let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["seller"]

const authRoutes = require("./auth.route");
const sellerRoutes = require("./seller.route");
const shopRoutes = require("./shop.route");
const categoryRoutes = require("./category.route");
const tagRoutes = require("./tag.route");
const fieldRoutes = require("./field.route");
const formRoutes = require("./form.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), sellerRoutes);
app.use("/shops", checkToken(allowedUsers), shopRoutes);
app.use("/categories", checkToken(allowedUsers), categoryRoutes);
app.use("/tags", checkToken(allowedUsers), tagRoutes);
app.use("/fields", checkToken(allowedUsers), fieldRoutes);
app.use("/forms", checkToken(allowedUsers), formRoutes);




module.exports = app