require("dotenv").config();
const express = require("express");
const app = express();
// const bodyParser = require("body-parser");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require('compression');
const path = require('path');
const i18n = require('i18n');
const toobusy = require('node-toobusy');
const connectToDatabase = require("./database").connectToDatabase;
const executeBatchJobs = require("../utils/batchSchedule.util").executeBatchJobs;
const handleCorsPolicy = require("../helpers/cors.helper");
const routes = require("../routes/index.route");
const { logInTestEnv } = require("../helpers/logger.helper");
const { citiesSeeder } = require("../seeders/cities.seed");

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, '..', 'locales'),
  defaultLocale: 'en',
  objectNotation: true,
});
app.use(i18n.init);
app.use(cors());
app.use(handleCorsPolicy);
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger("dev"));
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


app.use(function (req, res, next) {
  if (toobusy()) res.status(503).json({ success: false, code: 503, error: "Server is busy right now, sorry." });
  else next();
});


app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  logInTestEnv("error from handler", err.message)
  res.status(err.status || 500).json({ success: false, code: 500, error: "Internal Server Error!" });
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at promise ' + promise + ' reason ', reason);
  logInTestEnv('Server is still running...\n');
});


// globally catching unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception is thrown =>', error + '\n');
  process.exit();
});


app.use(routes);
connectToDatabase();
executeBatchJobs();
citiesSeeder();


module.exports = app;