const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    name: { type: String },
    permissions: { type: Object },
    createdAt: { type: Date, default: Date.now() },
})


const roleModel = mongoose.model("roles", roleSchema)


module.exports = roleModel;