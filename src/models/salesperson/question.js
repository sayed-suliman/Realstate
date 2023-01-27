const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    question: String,
    explain: String,
    options: Array,
    ans: Number,
    category: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sp_category" }],
      default: [],
      get: function (v) {
        return v.map((id) => id.toString());
      },
    },
  },
  {
    timestamps: true,
  }
);
const SP_Question = mongoose.model("Sp_question", schema);
module.exports = SP_Question;
