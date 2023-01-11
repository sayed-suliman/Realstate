const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    status: String,
    banner: {
      type: String,
      get: function (banner) {
        return `/images/course/${banner}`;
      },
    },
    package: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
    price: {
      type: Number,
    },
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  },
  {
    timestamps: true,
  }
);
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
