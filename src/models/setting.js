const mongoose = require("mongoose");
const SP_Category = require("./salesperson/category");
const settingSchema = mongoose.Schema({
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
  finalTakeTime: {
    type: Number,
    default: 60,
  },
  midTakeTime: {
    type: Number,
    default: 30,
  },
  mail: {
    port: String,
    host: String,
    email: String,
    user: String,
    pass: String,
  },
  payment: {
    stripe: {
      publicKey: String,
      secret: String,
    },
    paypal: {
      id: String,
      secret: String,
    },
  },
});

const Setting = mongoose.model("setting", settingSchema);

module.exports = Setting;
