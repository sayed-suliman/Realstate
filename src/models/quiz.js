const mongoose = require("mongoose")
const quizSchema = new mongoose.Schema({
    questions:Array,
    order:Number,
    name:String,
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    }
})
const Quiz = mongoose.model("Quiz",quizSchema)
module.exports = Quiz