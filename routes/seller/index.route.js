let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["seller"]

const authRoutes = require("./auth.route");
const sellerRoutes = require("./seller.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), sellerRoutes);
// app.use(checkToken(allowedUsers), isAuthorized, adminRoutes);


module.exports = app