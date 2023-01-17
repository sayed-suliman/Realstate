const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    title: String,
    order: Number,
    questions: Array,
  },
  {
    timestamps: true,
  }
);
const SP_Quiz = mongoose.model("Sp_quiz", schema);
module.exports = SP_Quiz;
