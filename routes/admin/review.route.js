const app = require("express").Router();
const reviewController = require("../../controllers/admin/review.controller")


app.get("/list", reviewController.listReviews);
app.get("/get", reviewController.getReview);

app.delete("/remove", reviewController.removeReview);




module.exports = app
