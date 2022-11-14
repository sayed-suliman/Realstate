const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    tax: Number,
    price: Number
}, {
    timestamps: true
})
const Package = mongoose.model('Package', packageSchema)
module.exports = Package