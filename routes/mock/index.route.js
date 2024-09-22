let express = require("express");
const app = express();

const customerQueryRoutes = require("./customerQuery.route");
const ifastRoutes = require("./ifast.route");
const firstFlightRoutes = require("./firstFlight.route");
const stripeRoutes = require("./stripe.route");




app.use("/query", customerQueryRoutes);
app.use("/ifast", ifastRoutes);
app.use("/firstFlight", firstFlightRoutes);
app.use("/stripe", stripeRoutes);



module.exports = app