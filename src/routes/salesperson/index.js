const express = require("express");
const { salesPersonDashboard } = require("../../controllers/dashboard");
const category = require("../../controllers/salesperson/category");
const router = express.Router();

router.get("/", salesPersonDashboard);

// quiz
router.get("/test-by-category", (req, res) => {
  res.render("dashboard/examples/salesperson/quiz", {
    title: "Quiz",
  });
});
router.get("/result-by-category", (req, res) => {
  res.render("dashboard/examples/salesperson/quiz", {
    result: true,
    title: "Quiz",
  });
});

// test
router.get("/tests", (req, res) => {
  res.render("dashboard/examples/salesperson/test", { title: "Test" });
});
router.get("/tests-result", (req, res) => {
  res.render("dashboard/examples/salesperson/test", {
    result: true,
    title: "Test",
  });
});

// exam
router.get("/exam", (req, res) => {
  res.render("dashboard/examples/salesperson/exam", { title: "Exam" });
});
router.get("/exam-result", (req, res) => {
  res.render("dashboard/examples/salesperson/exam", {
    title: "Exam",
    result: true,
  });
});

// ********************************
// Admin
// ********************************

router.get("/all-category", category.all);
router.get("/add-category", category.add);
router.get("/edit-category", category.edit);
router.post("/add-category", category.post);
module.exports = router;
