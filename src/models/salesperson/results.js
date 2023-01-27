const mongoose = require("mongoose");

const SP_Result = mongoose.model(
  "sp_result",
  new mongoose.Schema(
    {
      test: {
        type: mongoose.Schema.Types.Mixed,
        ref: ["Sp_category"],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      correct_ans: Array,
      wrong_ans: Array,
      points: Number,
      totalQuestions: Number,
      time: String,
      grade: String,
      take: Number,
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
