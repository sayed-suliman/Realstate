const express = require("express");
const { salesPersonDashboard } = require("../../controllers/dashboard");
const category = require("../../controllers/salesperson/category");
const question = require("../../controllers/salesperson/questions");
const quiz = require("../../controllers/salesperson/quiz");
const test = require("../../controllers/salesperson/test");
const { isAdmin, isStudent } = require("../../middleware/authentication");
const router = express.Router();

router.get("/", salesPersonDashboard);

// quiz
router.get("/test-by-category", isStudent, quiz.byCategory);
router.get("/result-by-category", isStudent, quiz.resultByCategory);

// test
router.get("/tests", isStudent, test.tests);
router.get("/tests-result", isStudent, test.testsResult);
router.get("/take-test", isStudent, test.takeTest);
router.post("/take-test", isStudent, test.takeTestPost);

// exam
router.get("/exam", isStudent, (req, res) => {
  res.render("dashboard/examples/salesperson/exam/exam", { title: "Exam" });
});
router.get("/exam-result", isStudent, (req, res) => {
  res.render("dashboard/examples/salesperson/exam/exam", {
    title: "Exam",
    result: true,
  });
});

// ********************************
// Admin
// ********************************

// Category
router.get("/all-categories", isAdmin, category.all);
router.get("/add-category", isAdmin, category.add);
router.get("/edit-category", isAdmin, category.edit);
router.post("/add-category", isAdmin, category.post);

// Questions
router.get("/all-questions", isAdmin, question.all);
router.get("/add-questions", isAdmin, question.add);
router.post("/add-questions", isAdmin, question.allPost);
router.get("/edit-question", isAdmin, question.edit);
router.post("/edit-question", isAdmin, question.post);

// Quiz
router.get("/all-quizzes", isAdmin, quiz.all);
router.get("/add-quiz", isAdmin, quiz.add);
router.post("/add-quiz", isAdmin, quiz.post);
router.get("/edit-quiz", isAdmin, quiz.edit);
router.post("/edit-quiz", isAdmin, quiz.editPost);

module.exports = router;
