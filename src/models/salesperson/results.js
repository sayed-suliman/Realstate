const mongoose = require("mongoose");

const SP_Result = mongoose.model(
  "sp_result",
  new mongoose.Schema(
    {
      // testId for category wise quiz
      test: {
        type: [{ type: mongoose.Schema.Types.Mixed, ref: ["Sp_category"] }],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      points: Number,
      correct_ans: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Sp_question" },
      ],
      wrong_ans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sp_question" }],
      totalQuestions: Number,
      time: String,
      grade: String,
      percent: Number,
      ans: {
        type: String,
        // convert database data to Object from string
        get: function (data) {
          try {
            return JSON.parse(data);
          } catch (error) {
            console.log("Mongoose Result:", error.message);
          }
        },
        // convert to string
        set: function (data) {
          return JSON.stringify(data);
        },
      },
    },
    {
      timestamps: true,
    }
  )
);
module.exports = SP_Result;
