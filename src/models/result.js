const mongoose = require('mongoose')

const Result = mongoose.model('result', new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quiz'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    correct_ans: Array,
    wrong_ans: Array,
    points: Number,
    totalQuestions: Number,
    time: String,
    grade: String,
    ans: {
        type: String,
        // convert database data to Object from string
        get: function (data) {
            try {
                return JSON.parse(data)
            } catch (error) {
                console.log("Mongoose Result:", error.message)
            }
        },
        // convert to string
        set: function (data) {
            return JSON.stringify(data)
        }
    }
}, {
    timestamps: true
}))
module.exports = Result