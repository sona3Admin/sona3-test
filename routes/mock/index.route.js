let express = require("express");
const app = express();

const ifastRoutes = require("./ifast.route");
const firstFlightRoutes = require("./firstFlight.route");
const stripeRoutes = require("./stripe.route");




app.use("/ifast", ifastRoutes);
app.use("/firstFlight", firstFlightRoutes);
app.use("/stripe", stripeRoutes);



module.exports = app