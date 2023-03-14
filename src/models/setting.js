const mongoose = require("mongoose");
const settingSchema = mongoose.Schema({
  logoPath: {
    type: String,
    get: function (logo) {
      if (logo) return `/images/${logo}`;
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

  // unlock final term after (day and time)
  finalDay: Number,
  finalTime: Number,

  // taking time for mid and final.(student to take exam in the below time)
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
      live: Boolean,
    },
  },
});

const Setting = mongoose.model("setting", settingSchema);

module.exports = Setting;
