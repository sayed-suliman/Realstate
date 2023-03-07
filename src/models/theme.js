const mongoose = require("mongoose");
const themeSchema = mongoose.Schema({
  colors: {
    primary: String,
    secondary: String,
  },
  fontFamily: {
    link: String,
    name: String,
  },
});

module.exports = Theme = mongoose.model("Theme", themeSchema);
