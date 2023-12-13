const app = require("express").Router();
const reviewController = require("../../controllers/seller/review.controller")


app.get("/list", reviewController.listReviews);
app.get("/get", reviewController.getReview);


module.exports = app
