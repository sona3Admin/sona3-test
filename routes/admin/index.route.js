let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
let { isAuthorized } = require("../../helpers/authorizer.helper")
const allowedUsers = ["superAdmin", "admin"]

const authRoutes = require("./auth.route");
const adminRoutes = require("./admin.route");
const roleRoutes = require("./role.route");
const permissionRoutes = require("./permission.route");


app.use(authRoutes)
// app.use(adminRoutes);
app.use(checkToken(allowedUsers), isAuthorized, adminRoutes);
app.use("/roles", checkToken(allowedUsers), isAuthorized, roleRoutes);
app.use("/permissions", checkToken(allowedUsers), isAuthorized, permissionRoutes);


module.exports = app