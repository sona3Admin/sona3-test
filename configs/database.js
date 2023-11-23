const mongoose = require("mongoose")

const uriMap = {
    loc: process.env.LOCAL_DB_CONNECTION_STRING,
    dev: process.env.DEV_DB_CONNECTION_STRING,
    test: process.env.TEST_DB_CONNECTION_STRING,
    prod: process.env.PROD_DB_CONNECTION_STRING,
};

const selectedEnv = process.env.NODE_ENV || 'dev'; // Default to 'dev' if NODE_ENV is not set

const uri = uriMap[selectedEnv];

const connection = async () => {
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            if (process.env.NODE_ENV !== 'test')
                console.log("Connected to MongoDB database successfully!");

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