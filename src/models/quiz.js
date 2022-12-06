const mongoose = require("mongoose")
const quizSchema = new mongoose.Schema({
    questions: Array,
    order: Number,
    name: String,
    type: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
    // ,
    // status: {
    //     default: 0,
    //     type: Number
    // }
})
const Quiz = mongoose.model("Quiz", quizSchema)
module.exports = Quiz