const mongoose = require("mongoose")
// const uri = process.env.LOCAL_DB_CONNECTION_STRING
const uri = process.env.DEV_DB_CONNECTION_STRING


const connection = async () => {
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
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