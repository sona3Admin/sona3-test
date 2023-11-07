const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    name: { type: String },
    permissions: { type: Object }
})


const roleModel = mongoose.model("roles", roleSchema)


module.exports = roleModel;