const mongoose = require("mongoose")
const vocherSchema = new mongoose.Schema({
    code:String,
    discount:Number,
    length:Number
})