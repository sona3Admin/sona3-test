const app = require("express").Router();
const reviewController = require("../../controllers/customer/review.controller")
const { checkIdentity } = require("../../helpers/authorizer.helper")


app.get("/list", reviewController.listReviews);
app.get("/get", reviewController.getReview);

app.post("/create", checkIdentity("customer"), reviewController.createReview);
app.put("/update", checkIdentity("customer"), reviewController.createReview);
app.delete("/remove", checkIdentity("customer"), reviewController.removeReview);




module.exports = app
