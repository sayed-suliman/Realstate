const mongoose = require("mongoose");

const Setting = mongoose.model(
  "setting",
  mongoose.Schema({
    logoPath: {
      type: String,
      get: function (logo) {
        return `/images/${logo}`;
      },
    },
    collegeName: String,
    collegeAddress: String,
    collegePhone: String,
    quizPassingMark: Number,
    midPassingMark: Number,
    finalPassingMark: Number,
    midRetake: Number,
    finalRetake: Number,
    quizPolicy: String,
    reviewQuiz: Boolean,
    showAnswer: Boolean,
    randomizeQuestions: Boolean,
    unlockCourse: Boolean,
    finalDay: Number,
    finalTime: Number,
  })
);

module.exports = Setting;
