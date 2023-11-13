let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
let { isAuthorized } = require("../../helpers/authorizer.helper")
const allowedUsers = ["superAdmin", "admin"]

const authRoutes = require("./auth.route");
const adminRoutes = require("./admin.route");
const roleRoutes = require("./role.route");
const permissionRoutes = require("./permission.route");

const customerRoutes = require("./customer.route");
const sellerRoutes = require("./seller.route");
const categoryRoutes = require("./category.route");
const tagRoutes = require("./tag.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), isAuthorized, adminRoutes);
app.use("/roles", checkToken(allowedUsers), isAuthorized, roleRoutes);
app.use("/permissions", checkToken(allowedUsers), isAuthorized, permissionRoutes);

app.use("/customers", checkToken(allowedUsers), isAuthorized, customerRoutes);
app.use("/sellers", checkToken(allowedUsers), isAuthorized, sellerRoutes);
app.use("/categories", checkToken(allowedUsers), isAuthorized, categoryRoutes);
app.use("/tags", checkToken(allowedUsers), isAuthorized, tagRoutes);

module.exports = app