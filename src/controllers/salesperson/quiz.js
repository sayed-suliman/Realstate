const Category = require("../../models/salesperson/category");
const Quiz = require("../../models/salesperson/quiz");
const Question = require("../../models/salesperson/question");
const { encodeMsg, decodeMsg } = require("../../helper/createMsg");
module.exports = {
  async all(req, res) {
    return res.send("all");
  },
  async add(req, res) {
    try {
      const categories = await Category.find();
      res.render("dashboard/examples/salesperson/quiz/add", {
        title: "Add Quiz",
        categories,
      });
    } catch (error) {
      // FIXME: redirect to all quizzes page
      res.redirect(
        "/dashboard/salesperson/dashboard?msg=" + encodeMsg(error.message)
      );
    }
  },
  async post(req, res) {
    try {
      const allQuestions = [];
      const data = req.body;
      const name = data.name;
      delete data.name;
      // because the body contain question title, option, category, and correct ans
      const questions = Object.keys(data).length / 4;
      for (let i = 1; i <= questions; i++) {
        allQuestions.push({
          question: data[`question-${i}`],
          options: data[`question-${i}-opt`],
          ans: data[`question-${i}-ans`],
          category: data[`assignCategory-${i}`],
        });
      }
      for await (let [index, question] of allQuestions.entries()) {
        const addQuestion = await Question(question).save();
        console.log(question.category);
        for await (let category of question.category.entries()) {
          let cat = await Category.findOne({ name: category });
          cat.question.push(addQuestion._id);
          console.log(cat.question, addQuestion._id);
          await cat.save();
        }
      }
      res.send(req.body);
    } catch (error) {
      // FIXME: redirect to all quizzes page
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
};
