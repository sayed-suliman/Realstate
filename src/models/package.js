const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    tax: Number,
    price: Number
},{
    timestamps:true
})
module.exports = mongoose.model('Package', packageSchema)