const mongoose = require("mongoose");

const tablePreferenceSchema = mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        required: true,
    },

    module: {
        type: String,
        required: true,
        trim: true,
    },

    visibleColumns: {
        type: [String],
        required: true,
        default: [],
    },
})

tablePreferenceSchema.index({ admin: 1, module: 1 }, { unique: true });

const tablePreferenceModel = mongoose.model("tablePreferences", tablePreferenceSchema)


module.exports = tablePreferenceModel;