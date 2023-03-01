const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: String,
    status: String,
    tax: Number,
    link: String,
    salesperson: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    price: Number,
    whoFor: Array,
    whatsIncluded: Array,
  },
  {
    timestamps: true,
  }
);
const Package = mongoose.model("Package", packageSchema);
module.exports = Package;
