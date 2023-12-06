const mongoose = require("mongoose")

const uriMap = {
    local: process.env.LOCAL_DB_CONNECTION_STRING,
    development: process.env.DEV_DB_CONNECTION_STRING,
    test: process.env.TEST_DB_CONNECTION_STRING,
    production: process.env.PROD_DB_CONNECTION_STRING,
};

const selectedEnv = process.env.NODE_ENV || 'development'; // Default to 'dev' if NODE_ENV is not set
console.log(`selectedEnv`, selectedEnv);
const uri = uriMap[selectedEnv];
console.log(`uri`, uri);

const connection = async () => {
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            // if (process.env.NODE_ENV !== 'local')
                console.log(`Connected to MongoDB database successfully on ${process.env.NODE_ENV} environment!`);

        }).catch((err) => {
            console.log("MongoDB Error: ", err);
        })
}


module.exports = {
    connection,
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