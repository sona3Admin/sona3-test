const app = require("express").Router();
const couponController = require("../../controllers/seller/coupon.controller")


app.get("/list", couponController.listCoupons);
app.get("/get", couponController.getCoupon);


module.exports = app
