const app = require("express").Router();
const couponController = require("../../controllers/customer/coupon.controller")

app.get("/list", couponController.listCoupons);
app.get("/get", couponController.getCoupon);

app.post("/applyOnCart", couponController.applyCouponOnCart);
app.delete("/cancelFromCart", couponController.cancelCouponFromCart);

app.post("/applyOnBasket", couponController.applyCouponOnBasket);
app.delete("/cancelFromBasket", couponController.cancelCouponFromBasket);

module.exports = app
