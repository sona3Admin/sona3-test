let express = require("express");
const app = express();

const ifastRoutes = require("./ifast.route");




app.use("/ifast", ifastRoutes);



module.exports = app