const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    name: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sp_question" }],
  },
  {
    timestamps: true,
  }
);
const SP_Category = mongoose.model("Sp_category", schema);
module.exports = SP_Category;
