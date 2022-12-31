const mongoose = require("mongoose");
const userMeta = mongoose.model(
  "user-meta",
  mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      chapter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chapter",
      },
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
      meta_key: String,
      meta_value: String,
    },
    {
      timestamps: true,
    }
  )
);

module.exports = userMeta;
