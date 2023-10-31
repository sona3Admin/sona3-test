let mongoose = require("mongoose");

let batchSchema = mongoose.Schema({
    operationName: { type: String, enum: ["deleteFiles"], default: "deleteFiles" },
    filesToDelete: [{ type: String }]
})


let batchModel = mongoose.model("batch", batchSchema)


module.exports = batchModel;