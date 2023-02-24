const mongoose = require("mongoose");
const uri = process.env.DB_URI;
mongoose
  .connect(uri)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("DB Error:", err.message);
  });
