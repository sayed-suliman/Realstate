const Category = require("../../models/salesperson/category");
const Quiz = require("../../models/salesperson/quiz");
const Question = require("../../models/salesperson/question");
const { encodeMsg, decodeMsg } = require("../../helper/createMsg");
const _ = require("lodash");

module.exports = {
  async all(req, res) {
    try {
      var msgToken = req.query.msg;
      var msg = {};
      if (msgToken) {
        msg = decodeMsg(msgToken);
      }
      let quizzes = await Quiz.find();
      res.render("dashboard/examples/salesperson/quiz/allQuizzes", {
        title: "Quizzes",
        toast: Object.keys(msg).length == 0 ? undefined : msg,
        quizzes,
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async edit(req, res) {
    try {
      let id = req.query.id;
      if (id) {
        const quiz = await Quiz.findById(id).populate("questions");
        if (quiz) {
          const categories = await Category.find();
          res.render("dashboard/examples/salesperson/quiz/edit", {
            title: "Edit Quiz",
            categories,
            quiz,
          });
        } else {
          return res.redirect(
            "/dashboard/salesperson/all-quizzes?msg=" +
              encodeMsg("Quiz no found.", "danger")
          );
        }
      } else {
        return res.redirect(
          "/dashboard/salesperson/all-quizzes?msg=" +
            encodeMsg("Id must be required to edit Quiz.", "danger")
        );
      }
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/all-quizzes?msg=" + encodeMsg(error.message)
      );
    }
  },
  async add(req, res) {
    try {
      const categories = await Category.find();
      res.render("dashboard/examples/salesperson/quiz/add", {
        title: "Add Quiz",
        categories,
      });
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/all-quizzes?msg=" + encodeMsg(error.message)
      );
    }
  },
  async post(req, res) {
    try {
      const allQuestions = [];
      const data = req.body;
      const title = data.name;
      let questionsId = [];
      delete data.name;

      // because the data contain question title, option, category, and correct ans
      const noOfQ = Object.keys(data).length / 4;
      for (let i = 1; i <= noOfQ; i++) {
        allQuestions.push({
          question: data[`question-${i}`],
          options: data[`question-${i}-opt`],
          ans: data[`question-${i}-ans`],
          category: Array.isArray(data[`assignCategory-${i}`])
            ? data[`assignCategory-${i}`]
            : [data[`assignCategory-${i}`]],
        });
      }

      // add questions to sp_question collection
      // and each question to its selected category
      for await (let [index, question] of allQuestions.entries()) {
        const addQuestion = await Question(question).save();
        // adding question to array
        questionsId.push(addQuestion._id);
        if (Array.isArray(question.category)) {
          for await (let category of question.category) {
            let cat = await Category.findById(category);
            cat.questions.push(addQuestion._id);
            await cat.save();
          }
        } else {
          let cat = await Category.findById(question.category);
          cat.questions.push(addQuestion._id);
          await cat.save();
        }
      }
      let quizObj = {
        title,
        questions: questionsId,
      };
      let addQuiz = await Quiz(quizObj).save();
      if (addQuiz) {
        return res.redirect(
          "/dashboard/salesperson/all-quizzes?msg=" +
            encodeMsg("Quiz added Successfully.")
        );
      }
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-quizzes?msg=" +
          encodeMsg(error.message, "danger")
      );
    }
  },
  async editPost(req, res) {
    try {
      const allQuestions = [];
      const data = req.body;
      const quizId = req.body.id;
      const title = data.name;
      let questionsId = [];
      delete data.name;
      delete data.id;

      let existQuiz = await Quiz.findById(quizId);
      if (existQuiz) {
        // because the data contain question title, id, options, category, and correct ans
        const noOfQ = Object.keys(data).length / 5;
        for (let i = 1; i <= noOfQ; i++) {
          allQuestions.push({
            _id: data[`question-${i}-id`],
            question: data[`question-${i}`],
            options: data[`question-${i}-opt`],
            ans: Number(data[`question-${i}-ans`]),
            category: Array.isArray(data[`assignCategory-${i}`])
              ? data[`assignCategory-${i}`]
              : [data[`assignCategory-${i}`]],
          });
        }
        for await (let [index, newQuestion] of allQuestions.entries()) {
          let categories = [];
          // if new question is added to the quiz
          if (newQuestion._id == "undefined") {
            delete newQuestion._id;
            let question = await Question(newQuestion).save();
            questionsId.push(question._id);
          } else {
            let oldQuestion = await Question.findById(newQuestion._id);

            questionsId.push(oldQuestion._id);
            oldQuestion.question = newQuestion.question;
            oldQuestion.options = newQuestion.options;
            oldQuestion.ans = newQuestion.ans;
            // removing
            // question is removed from these categories
            let delFromCateId = _.difference(
              oldQuestion.category,
              newQuestion.category
            );
            if (delFromCateId.length) {
              // add all old categories.
              categories.concat(oldQuestion.category);

              // updating the removed category i.e removing this question from it
              for await (const [index, delCatID] of delFromCateId.entries()) {
                let deletedCategory = await Category.findById(delCatID);
                deletedCategory.questions.splice(
                  deletedCategory.questions.indexOf(newQuestion._id),
                  1
                );
                await deletedCategory.save();
                
                // remove the deleted cat from the list
                categories.splice(categories.indexOf(delCatID), 1);
              }
              oldQuestion.category = categories;
            }
            // adding
            // question is added to these categories
            let addToCateID = _.difference(
              newQuestion.category,
              oldQuestion.category
            );

            if (addToCateID.length) {
              // updating the categories where the question is added to it.
              // also adding the Category to that question
              for await (const [index, ID] of addToCateID.entries()) {
                let addToCat = await Category.findById(ID);

                if (!addToCat.questions.includes(newQuestion._id)) {
                  addToCat.questions.push(newQuestion._id);
                  await addToCat.save();
                }
                //adding category to question
                if (!oldQuestion.category.includes(ID)) {
                  categories.push(ID);
                }
              }
              categories = categories.concat(oldQuestion.category);
              oldQuestion.category = categories;
            }
            await oldQuestion.save();
          }
        }
        let quizObj = {
          title,
          questions: questionsId,
        };
        let updatedQuiz = await Quiz.findByIdAndUpdate(quizId, quizObj);
        if (updatedQuiz) {
          return res.redirect(
            "/dashboard/salesperson/all-quizzes?msg=" +
              encodeMsg("Quiz updated Successfully.")
          );
        }
      } else {
        return res.redirect(
          "/dashboard/salesperson/all-quizzes?msg=" +
            encodeMsg("Quiz not found.", "danger")
        );
      }
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-quizzes?msg=" +
          encodeMsg(error.message, "danger")
      );
    }
  },
  async byCategory(req, res) {
    try {
      const categories = await Category.find().populate("questions");
      res.render("dashboard/examples/salesperson/quiz/quiz", {
        title: "Quiz",
        categories,
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async resultByCategory(req, res) {
    try {
      res.render("dashboard/examples/salesperson/quiz/quiz", {
        result: true,
        title: "Quiz",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
};
