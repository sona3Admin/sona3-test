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
const shopRoutes = require("./shop.route");
const categoryRoutes = require("./category.route");
const tagRoutes = require("./tag.route");
const fieldRoutes = require("./field.route");
const formRoutes = require("./form.route");
const productRoutes = require("./product.route");
const variationRoutes = require("./variation.route");
const serviceRoutes = require("./service.route");
const bannerRoutes = require("./banner.route");
const wishlistRoutes = require("./wishlist.route")
const cartRoutes = require("./cart.route")
const basketRoutes = require("./basket.route")
const orderRoutes = require("./order.route")
const requestRoutes = require("./request.route");
const reviewRoutes = require("./review.route");
const couponRoutes = require("./coupon.route");
const roomRoutes = require("./room.route");
const notificationRoutes = require("./notification.route");
const settingRoutes = require("./setting.route");
const dashboardRoutes = require("./dashboard.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), isAuthorized, adminRoutes);
app.use("/roles", checkToken(allowedUsers), isAuthorized, roleRoutes);
app.use("/permissions", checkToken(allowedUsers), isAuthorized, permissionRoutes);

app.use("/customers", checkToken(allowedUsers), isAuthorized, customerRoutes);
app.use("/sellers", checkToken(allowedUsers), isAuthorized, sellerRoutes);
app.use("/shops", checkToken(allowedUsers), shopRoutes);
app.use("/categories", checkToken(allowedUsers), isAuthorized, categoryRoutes);
app.use("/tags", checkToken(allowedUsers), isAuthorized, tagRoutes);
app.use("/fields", checkToken(allowedUsers), isAuthorized, fieldRoutes);
app.use("/forms", checkToken(allowedUsers), isAuthorized, formRoutes);
app.use("/products", checkToken(allowedUsers), isAuthorized, productRoutes);
app.use("/variations", checkToken(allowedUsers), isAuthorized, variationRoutes);
app.use("/services", checkToken(allowedUsers), isAuthorized, serviceRoutes);
app.use("/banners", checkToken(allowedUsers), isAuthorized, bannerRoutes);
app.use("/wishlists", checkToken(allowedUsers), isAuthorized, wishlistRoutes);
app.use("/carts", checkToken(allowedUsers), isAuthorized, cartRoutes);
app.use("/baskets", checkToken(allowedUsers), isAuthorized, basketRoutes);
app.use("/orders", checkToken(allowedUsers), isAuthorized, orderRoutes);
app.use("/requests", checkToken(allowedUsers), isAuthorized, requestRoutes);
app.use("/reviews", checkToken(allowedUsers), isAuthorized, reviewRoutes);
app.use("/coupons", checkToken(allowedUsers), isAuthorized, couponRoutes);
app.use("/rooms", checkToken(allowedUsers), isAuthorized, roomRoutes);
app.use("/notifications", checkToken(allowedUsers), isAuthorized, notificationRoutes);
app.use("/settings", checkToken(allowedUsers), isAuthorized, settingRoutes);
app.use("/dashboard", checkToken(allowedUsers), isAuthorized, dashboardRoutes);


module.exports = app