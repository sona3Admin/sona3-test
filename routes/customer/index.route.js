let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["customer"]

const authRoutes = require("./auth.route");
const customerRoutes = require("./customer.route");
const shopRoutes = require("./shop.route");
const categoryRoutes = require("./category.route");
const tagRoutes = require("./tag.route");
const productRoutes = require("./product.route");
const variationRoutes = require("./variation.route");
const serviceRoutes = require("./service.route");
const bannerRoutes = require("./banner.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), customerRoutes);
app.use("/shops", checkToken(allowedUsers), shopRoutes);
app.use("/categories", checkToken(allowedUsers), categoryRoutes);
app.use("/tags", checkToken(allowedUsers), tagRoutes);
app.use("/products", checkToken(allowedUsers), productRoutes);
app.use("/variations", checkToken(allowedUsers), variationRoutes);
app.use("/services", checkToken(allowedUsers), serviceRoutes);
app.use("/banners", checkToken(allowedUsers), bannerRoutes);


module.exports = app