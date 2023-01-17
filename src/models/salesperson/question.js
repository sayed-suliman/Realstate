const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    question: String,
    options: Array,
    ans: Number,
    category: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const SP_Question = mongoose.model("Sp_question", schema);
module.exports = SP_Question;
