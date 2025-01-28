let express = require("express");
const app = express();

const customerQueryRoutes = require("./customerQuery.route");
const ifastRoutes = require("./ifast.route");
const firstFlightRoutes = require("./firstFlight.route");
const stripeRoutes = require("./stripe.route");
const emailRoutes = require("./email.route");
const s3Routes = require("./s3.route");



app.use("/query", customerQueryRoutes);
app.use("/ifast", ifastRoutes);
app.use("/firstFlight", firstFlightRoutes);
app.use("/stripe", stripeRoutes);
app.use("/email", emailRoutes);
app.use("/s3", s3Routes);


module.exports = app