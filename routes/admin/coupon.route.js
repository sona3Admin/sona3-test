const app = require("express").Router();
const couponController = require("../../controllers/admin/coupon.controller")
const { createCouponValidation, updateCouponValidation } = require("../../validations/coupon.validation")
const validator = require("../../helpers/validation.helper")

app.post("/create", validator(createCouponValidation), couponController.createCoupon);
app.put("/update", validator(updateCouponValidation), couponController.updateCoupon);
app.delete("/remove", couponController.removeCoupon);

app.get("/list", couponController.listCoupons);
app.get("/get", couponController.getCoupon);


module.exports = app
