const mongoose = require("mongoose")
const quizSchema = require({
    name:String,
    correct:String,
    question:String,
    order:Number,
    options:Array,
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    }
})