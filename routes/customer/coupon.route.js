const app = require("express").Router();
const couponController = require("../../controllers/customer/coupon.controller")

app.get("/list", couponController.listCoupons);
app.get("/get", couponController.getCoupon);


module.exports = app
