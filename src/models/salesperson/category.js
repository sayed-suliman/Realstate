const mongoose = require("mongoose");
const schema = mongoose.Schema({
  name: String,
});
const SP_Category = mongoose.model("Sp_category", schema);
module.exports = SP_Category;
