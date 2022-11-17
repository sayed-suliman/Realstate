const mongoose = require("mongoose");

const resetToken = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    expire_at: {
        type: Date,
        default: Date.now,
        expires: 600//seconds
    }
})
const RestToken = mongoose.model('resetToken', resetToken)
module.exports = RestToken