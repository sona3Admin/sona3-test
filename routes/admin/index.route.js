let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["superAdmin", "admin"]

const authRoutes = require("./auth.route");
const adminRoutes = require("./admin.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), adminRoutes);


module.exports = app