const express = require("express");
const { salesPersonDashboard } = require("../../controllers/dashboard");
const category = require("../../controllers/salesperson/category");
const exam = require("../../controllers/salesperson/exam");
const question = require("../../controllers/salesperson/questions");
const quiz = require("../../controllers/salesperson/quiz");
const test = require("../../controllers/salesperson/test");
const { isAdmin, isStudent } = require("../../middleware/authentication");
const router = express.Router();

router.get("/", salesPersonDashboard);

// quiz
router.get("/test-by-category", isStudent, quiz.byCategory);
router.get("/result-by-category", isStudent, quiz.resultByCategory);
router.get("/take-quiz", isStudent, quiz.takeQuiz);
router.post("/take-quiz", quiz.takeQuizPost);

// test
router.get("/tests", isStudent, test.tests);
router.get("/tests-result", isStudent, test.testsResult);

// exam
router.get("/exam", isStudent, exam.exam);
router.get("/exam-result", isStudent, exam.result);
router.get("/take-exam", isStudent, quiz.takeQuiz);

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

// test
router.get("/all-tests", isAdmin, quiz.all);
router.get("/add-test", isAdmin, quiz.add);
router.post("/add-test", isAdmin, quiz.post);
router.get("/edit-quiz", isAdmin, quiz.edit);
router.post("/edit-quiz", isAdmin, quiz.editPost);

// exam
router.get("/all-exams", isAdmin, exam.all);
router.get("/add-exam", isAdmin, exam.add);
router.post("/add-exam", isAdmin, exam.post);
router.get("/edit-exam", isAdmin, exam.edit);
router.post("/edit-exam", isAdmin, exam.editPost);

module.exports = router;
