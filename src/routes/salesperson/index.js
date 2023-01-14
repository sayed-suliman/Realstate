const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("dashboard/examples/salesperson/index");
});
router.get("/test-by-category", (req, res) => {
  res.render("dashboard/examples/salesperson/quiz");
});

module.exports = router;
