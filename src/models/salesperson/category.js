const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    name: String,
    questions: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sp_question",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const SP_Category = mongoose.model("Sp_category", schema);
module.exports = SP_Category;
