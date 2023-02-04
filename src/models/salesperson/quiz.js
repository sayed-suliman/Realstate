const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    title: String,
    // type: String,
    order: {
      type: Number,
      default: 0,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sp_question" }],
  },
  {
    timestamps: true,
  }
);
const SP_Quiz = mongoose.model("Sp_quiz", schema);
module.exports = SP_Quiz;
