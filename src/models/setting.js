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
  stripeSecretKey: String,
  stripePublishKey: String,
  paypalClientID: String,
  paypalClientSecret: String,
  mailHost: String,
  mailPort: String,
  mailUser: String,
  mailPass: String,
  mailEmail: String,
  finalTakeTime: {
    type: Number,
    default: 60,
  },
  midTakeTime: {
    type: Number,
    default: 30,
  },
});

const Setting = mongoose.model("setting", settingSchema);

module.exports = Setting;
