const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    question: String,
    explain: String,
    options: Array,
    ans: Number,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      default: "",
      ref: "Sp_category",
    },
  },
  {
    timestamps: true,
  }
);
const SP_Question = mongoose.model("Sp_question", schema);
module.exports = SP_Question;
