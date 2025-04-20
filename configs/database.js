const mongoose = require("mongoose")
const { logInTestEnv } = require("../helpers/logger.helper");

const uriMap = {
    local: process.env.LOCAL_DB_CONNECTION_STRING,
    development: process.env.DEV_DB_CONNECTION_STRING,
    test: process.env.TEST_DB_CONNECTION_STRING,
    production: process.env.PROD_DB_CONNECTION_STRING,
};

logInTestEnv("CURRENT_ENV", process.env.CURRENT_ENV);
const selectedEnv = process.env.CURRENT_ENV || 'development'; // Default to 'dev' if CURRENT_ENV is not set
let uri = uriMap[selectedEnv];

const connectToDatabase = async () => {
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            // if (process.env.CURRENT_ENV !== 'local')
            logInTestEnv(`Connected to MongoDB database successfully on ${selectedEnv} environment!`);

        }).catch((err) => {
            logInTestEnv("MongoDB Error: ", err);
        })
}


module.exports = {
    connectToDatabase,
    mongoose,
    uri,
    connect: () => {
        mongoose.Promise = Promise;
        mongoose.connect(uri);
    },
    disconnect: done => {
        mongoose.disconnect(done);
    }
};