require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require('compression');
const path = require('path');
const i18n = require('i18n');
const databaseConnection = require("./database").connection;
const executeBatchJobs = require("../utils/batchSchedule.util").executeBatchJobs;
const handleCorsPolicy = require("../helpers/cors.helper");
const routes = require("../routes/index.route");


databaseConnection();
executeBatchJobs();
i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, '..', 'locales'),
  defaultLocale: 'en',
  objectNotation: true,
});
app.use(i18n.init);
app.use(cors());
app.use(handleCorsPolicy);
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "'unsafe-inline'"]
    }
  }
}));
app.use(compression())
app.set("view engine", "ejs")
// app.use(express.static(path.join(__dirname, '../public')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(routes);


module.exports = app;