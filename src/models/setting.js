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
  spExamQuCount: {
    type: Number,
    default: 0,
  },
  finalTakeTime: {
    type: Number,
    default: 60,
  },
  midTakeTime: {
    type: Number,
    default: 30,
  },
});

settingSchema.pre("save", function (next) {
  SP_Category.find({}, function (error, categories) {
    if (error) {
      return next(error);
    }
    let noOfQuestions = categories
      .map((category) => {
        return category.questions.length;
      })
      .reduce((a, b) => {
        return a + b;
      });
    this.spExamQuCount = noOfQuestions;
    console.log("save called", noOfQuestions);
  });
});
settingSchema.pre("findByIdAndUpdate", function (next) {
  console.log("hello");
  SP_Category.find({}, function (error, categories) {
    if (error) {
      return next(error);
    }
    let noOfQuestions = categories
      .map((category) => {
        return category.questions.length;
      })
      .reduce((a, b) => {
        return a + b;
      });
    this.spExamQuCount = noOfQuestions;
  });
  console.log("updated called", noOfQuestions);
  return next();
});

const Setting = mongoose.model("setting", settingSchema);

module.exports = Setting;
