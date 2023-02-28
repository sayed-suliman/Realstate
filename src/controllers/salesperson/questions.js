const { encodeMsg, decodeMsg } = require("../../helper/createMsg");
const Category = require("../../models/salesperson/category");
const Question = require("../../models/salesperson/question");

exports.all = async (req, res) => {
  try {
    var msgToken = req.query.msg;
    var msg = {};
    if (msgToken) {
      msg = decodeMsg(msgToken);
    }
    let questions = await Question.find().populate("category");
    res.render("dashboard/examples/salesperson/questions/allQuestions", {
      title: "Questions",
      toast: Object.keys(msg).length == 0 ? undefined : msg,
      questions,
    });
  } catch (error) {
    return res.redirect(
      "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
    );
  }
};

exports.add = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("dashboard/examples/salesperson/questions/add", {
      title: "Add Question",
      categories,
    });
  } catch (error) {
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg(error.message, "danger")
    );
  }
};
exports.edit = async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const question = await Question.findById(id);
      const categories = await Category.find();
      return res.render("dashboard/examples/salesperson/questions/add", {
        title: "Edit Question",
        categories,
        question,
        edit: true,
      });
    }
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg("Question ID must be required.", "danger")
    );
  } catch (error) {
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg(error.message, "danger")
    );
  }
};

// @post method 
// add all questions
exports.allPost = async (req, res) => {
  try {
    const allQuestions = [];
    const data = req.body;

    // because the data contain question title, explain option, category, and correct ans
    const noOfQ = Object.keys(data).length / 5;
    for (let i = 1; i <= noOfQ; i++) {
      allQuestions.push({
        question: data[`question-${i}`].trim(),
        explain: data[`question-${i}-explain`].trim(),
        options: data[`question-${i}-opt`],
        ans: Number(data[`question-${i}-ans`]),
        category: data[`assignCategory-${i}`],
      });
    }
    // add questions to sp_question collection
    // and each question to its selected category
    for await (let [index, question] of allQuestions.entries()) {
      const addQuestion = await Question(question).save();

      // adding question to selected categories
      let category = await Category.findById(question.category);
      category.questions.push(addQuestion._id);
      await category.save();
    }
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg("Questions are added Successfully.")
    );
  } catch (error) {
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg(error.message, "danger")
    );
  }
};

// @post method
// edit question
exports.post = async (req, res) => {
  try {
    const updatingQuestion = {};
    const data = req.body;
    const questionId = data[`question-id`];

    updatingQuestion.question = data[`question-1`].trim();
    updatingQuestion.explain = data[`question-1-explain`].trim();
    updatingQuestion.options = data[`question-1-opt`];
    updatingQuestion.ans = Number(data[`question-1-ans`]);
    updatingQuestion.category = data[`assignCategory-1`];

    let question = await Question.findById(questionId);
    if (question) {
      let oldCategory = question.category;
      await Question.findByIdAndUpdate(questionId, updatingQuestion);

      if (updatingQuestion.category != oldCategory) {
        // removing from the old category
        await updateQuesInCategory(oldCategory, questionId, false);
        // and add to the new category
        await updateQuesInCategory(updatingQuestion.category, questionId);
      }

      // TODO: for multiple category selection
      // add question to category
      // for await (let [index, category] of updatingQuestion.category.entries()) {
      // if (oldCategory != updatingQuestion.category) {
      // console.log(updatingQuestion.category)
      // adding
      // await updateQuesInCategory(updatingQuestion.category, questionId);
      // }
      // }

      // removing from the old category
      // for await (let [index, category] of oldCategory.entries()) {
      // if (updatingQuestion.category != oldCategory) {
      // removing from the old category
      // await updateQuesInCategory(oldCategory, questionId, false);
      // }
      // }

      return res.redirect(
        "/dashboard/salesperson/all-questions?msg=" +
          encodeMsg("Question updated Successfully.")
      );
    }
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg("Question not found.", "danger")
    );
  } catch (error) {
    return res.redirect(
      "/dashboard/salesperson/all-questions?msg=" +
        encodeMsg(error.message, "danger")
    );
  }
};

async function updateQuesInCategory(categoryId, questionId, add = true) {
  let cat = await Category.findById(categoryId);
  // adding to category
  if (add && !cat.questions.includes(questionId)) {
    cat.questions.push(questionId);
    await cat.save();
  } else {
    // removing from category
    cat.questions.splice(cat.questions.indexOf(questionId), 1);
    await cat.save();
  }
}
