let app = require("express").Router();
let adminRoutes = require("./admin/index.route")
let customerRoutes = require("./customer/index.route")
let sellerRoutes = require("./seller/index.route")
const i18n = require('i18n');


app.get("/", (req, res) => {
    return res.status(200).json({ success: true, message: i18n.__('welcomeMessage'), code: 200 })
})


app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/seller", sellerRoutes);


app.all("*", (req, res) => {
    return res.status(404).json({ success: false, error: res.__('invalidRequest'), code: 404 })
})

module.exports = app;
