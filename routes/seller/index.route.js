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
const productRoutes = require("./product.route");
const variationRoutes = require("./variation.route");
const serviceRoutes = require("./service.route");
const bannerRoutes = require("./banner.route");
const orderRoutes = require("./order.route");
const requestRoutes = require("./request.route");
const reviewRoutes = require("./review.route");
const couponRoutes = require("./coupon.route");
const roomRoutes = require("./room.route");
const notificationRoutes = require("./notification.route");
const tiersRoutes = require("./subscription.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), sellerRoutes);
app.use("/shops", checkToken(allowedUsers), shopRoutes);
app.use("/categories", checkToken(allowedUsers), categoryRoutes);
app.use("/tags", checkToken(allowedUsers), tagRoutes);
app.use("/fields", checkToken(allowedUsers), fieldRoutes);
app.use("/forms", checkToken(allowedUsers), formRoutes);
app.use("/products", checkToken(allowedUsers), productRoutes);
app.use("/variations", checkToken(allowedUsers), variationRoutes);
app.use("/services", checkToken(allowedUsers), serviceRoutes);
app.use("/banners", checkToken(allowedUsers), bannerRoutes);
app.use("/orders", checkToken(allowedUsers), orderRoutes);
app.use("/requests", checkToken(allowedUsers), requestRoutes);
app.use("/reviews", checkToken(allowedUsers), reviewRoutes);
app.use("/coupons", checkToken(allowedUsers), couponRoutes);
app.use("/rooms", checkToken(allowedUsers), roomRoutes);
app.use("/notifications", checkToken(allowedUsers), notificationRoutes);
app.use("/tiers", checkToken(allowedUsers), tiersRoutes);


module.exports = app