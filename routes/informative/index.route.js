let express = require("express");
const app = express();
const complaintRoutes = require("./complaint.route")


app.use("/complaints", complaintRoutes);


module.exports = app