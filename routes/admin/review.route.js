const app = require("express").Router();
const reviewController = require("../../controllers/customer/review.controller")


app.get("/list", reviewController.listReviews);
app.get("/get", reviewController.getReview);

app.delete("/remove", reviewController.removeReview);




module.exports = app
