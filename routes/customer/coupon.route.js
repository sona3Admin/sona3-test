const app = require("express").Router();
const couponController = require("../../controllers/customer/coupon.controller")

app.get("/list", couponController.listCoupons);
app.get("/get", couponController.getCoupon);

app.post("/apply", couponController.applyCoupon);
app.delete("/cancel", couponController.cancelCoupon);

module.exports = app
