const mongoose = require("mongoose")
const contactSchema = mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    read: {
        default: false,
        type: Boolean
    }
}, {
    timestamp: true
})
const messages = mongoose.model("messages", contactSchema)
module.exports = messages