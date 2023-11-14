let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
const { checkIdentity } = require("../../helpers/authorizer.helper")

const allowedUsers = ["customer"]

const authRoutes = require("./auth.route");
const customerRoutes = require("./customer.route");
const shopRoutes = require("./shop.route");
const categoryRoutes = require("./category.route");
const tagRoutes = require("./tag.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), customerRoutes);
app.use("/shops", checkToken(allowedUsers), shopRoutes);
app.use("/categories", checkToken(allowedUsers), categoryRoutes);
app.use("/tags", checkToken(allowedUsers), tagRoutes);


module.exports = app