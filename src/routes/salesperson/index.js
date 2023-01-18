const express = require("express");
const { salesPersonDashboard } = require("../../controllers/dashboard");
const category = require("../../controllers/salesperson/category");
const quiz = require("../../controllers/salesperson/quiz");
const router = express.Router();

router.get("/", salesPersonDashboard);

// quiz
router.get("/test-by-category", (req, res) => {
  res.render("dashboard/examples/salesperson/quiz/quiz", {
    title: "Quiz",
  });
});
router.get("/result-by-category", (req, res) => {
  res.render("dashboard/examples/salesperson/quiz/quiz", {
    result: true,
    title: "Quiz",
  });
});

// test
router.get("/tests", (req, res) => {
  res.render("dashboard/examples/salesperson/tests/test", { title: "Test" });
});
router.get("/tests-result", (req, res) => {
  res.render("dashboard/examples/salesperson/tests/test", {
    result: true,
    title: "Test",
  });
});

// exam
router.get("/exam", (req, res) => {
  res.render("dashboard/examples/salesperson/exam/exam", { title: "Exam" });
});
router.get("/exam-result", (req, res) => {
  res.render("dashboard/examples/salesperson/exam/exam", {
    title: "Exam",
    result: true,
  });
});

// ********************************
// Admin
// ********************************

// Category
router.get("/all-categories", category.all);
router.get("/add-category", category.add);
router.get("/edit-category", category.edit);
router.post("/add-category", category.post);

// Quiz
router.get("/all-quizzes", quiz.all);
router.get("/add-quiz", quiz.add);
router.post("/add-quiz", quiz.post);
router.get("/edit-quiz", quiz.edit);
router.post("/edit-quiz", quiz.editPost);

module.exports = router;
