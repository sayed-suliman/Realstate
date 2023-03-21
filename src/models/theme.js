const mongoose = require("mongoose");
const themeSchema = mongoose.Schema({
  colors: {
    primary: String,
    secondary: String,
  },
  fontFamily: {
    name: String,
  },
});

module.exports = Theme = mongoose.model("Theme", themeSchema);
