const mongoose = require('mongoose')

const Setting = mongoose.model('setting', mongoose.Schema({
    logoPath: {
        type: String,
        get: function (logo) {
            return `/images/${logo}`
        }
    },
    collegeName: String,
    collegeAddress: String,
    collegePhone: String,
    passingMark: Number,
    midRetake: Number,
    finalRetake: Number,
    quizPolicy: String,
    reviewQuiz: Boolean,

}))

module.exports = Setting