const Category = require("../../models/salesperson/category");
const Quiz = require("../../models/salesperson/quiz");
const Question = require("../../models/salesperson/question");
const { encodeMsg, decodeMsg } = require("../../helper/createMsg");
const _ = require("lodash");
const Result = require("../../models/salesperson/results");
const { default: mongoose } = require("mongoose");
const { updateQuesInCategory } = require("../../helper/updateQuestionInCat");

module.exports = {
  async all(req, res) {
    try {
      var msgToken = req.query.msg;
      var msg = {};
      if (msgToken) {
        msg = decodeMsg(msgToken);
      }
      let tests = await Quiz.find();
      res.render("dashboard/examples/salesperson/quiz/allQuizzes", {
        title: "Tests",
        toast: Object.keys(msg).length == 0 ? undefined : msg,
        tests,
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
            "/dashboard/salesperson/all-tests?msg=" +
              encodeMsg("Quiz not found.", "danger")
          );
        }
      } else {
        return res.redirect(
          "/dashboard/salesperson/all-tests?msg=" +
            encodeMsg("Id must be required to edit Quiz.", "danger")
        );
      }
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/all-tests?msg=" + encodeMsg(error.message)
      );
    }
  },
  async add(req, res) {
    try {
      const categories = await Category.find();
      res.render("dashboard/examples/salesperson/quiz/add", {
        title: "Add Test",
        categories,
      });
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/all-tests?msg=" + encodeMsg(error.message)
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
          explain: data[`explain-${i}`],
          options: data[`question-${i}-opt`],
          ans: data[`question-${i}-ans`],
          category: data[`assignCategory-${i}`],
        });
      }

      // add questions to sp_question collection
      // and each question to its selected category
      for await (let [index, question] of allQuestions.entries()) {
        const addQuestion = await Question(question).save();
        // adding question to array
        questionsId.push(addQuestion._id);
        let cat = await Category.findById(question.category);
        cat.questions.push(addQuestion._id);
        await cat.save();
      }
      let quizObj = {
        title,
        questions: questionsId,
      };
      let addQuiz = await Quiz(quizObj).save();
      if (addQuiz) {
        return res.redirect(
          "/dashboard/salesperson/all-tests?msg=" +
            encodeMsg("Quiz added Successfully.")
        );
      }
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-tests?msg=" +
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
      const type = "test";
      let questionsId = [];
      delete data.name;
      delete data.id;

      let existQuiz = await Quiz.findById(quizId);
      if (existQuiz) {
        // because the data contain question title, id, options, category, and correct ans
        const noOfQ = Object.keys(data).length / 6;
        for (let i = 1; i <= noOfQ; i++) {
          allQuestions.push({
            _id: data[`question-${i}-id`],
            question: data[`question-${i}`],
            explain: data[`explain-${i}`],
            options: data[`question-${i}-opt`],
            ans: Number(data[`question-${i}-ans`]),
            category: data[`assignCategory-${i}`],
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
            // explain: when there is change in question title, option and ans.
            // assign options, ans and question to the oldQuestion(database question)
            oldQuestion.question = newQuestion.question;
            oldQuestion.options = newQuestion.options;
            oldQuestion.ans = newQuestion.ans;
            oldQuestion.explain = newQuestion.explain;

            if (newQuestion.category != oldQuestion.category) {
              // removing from the old category
              await updateQuesInCategory(
                oldQuestion.category,
                oldQuestion._id,
                false
              );
              // and add to the new category
              await updateQuesInCategory(newQuestion.category, oldQuestion._id);
            }
            oldQuestion.category = newQuestion.category;
            // Question is updated with new (title, category,options and ans)
            oldQuestion.save();
          }
        }
        let quizObj = {
          title,
          type,
          questions: questionsId,
        };
        let updatedQuiz = await Quiz.findByIdAndUpdate(quizId, quizObj);
        if (updatedQuiz) {
          return res.redirect(
            "/dashboard/salesperson/all-tests?msg=" +
              encodeMsg("Quiz updated Successfully.")
          );
        }
      } else {
        return res.redirect(
          "/dashboard/salesperson/all-tests?msg=" +
            encodeMsg("Quiz not found.", "danger")
        );
      }
    } catch (error) {
      console.log(error);
      return res.redirect(
        "/dashboard/salesperson/all-tests?msg=" +
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
      const result = await Result.find({
        test: { $elemMatch: { model: "Sp_category" } },
        user: req.user._id,
      }).populate("test._id");
      res.render("dashboard/examples/salesperson/quiz/quiz", {
        result: result.length ? result : true,
        title: "Quiz",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async takeQuiz(req, res) {
    try {
      const id = req.query.id;
      const categoryTest = req.query["by-category"];
      let test, testByCategory;
      // used to store the questions ID of the current test
      let questionsID = [];
      if (categoryTest == "true") {
        test = await Category.findById(id).populate("questions");
        testByCategory = true;
      } else {
        // exam mean master exam
        if (req.query.exam == "true") {
          let categories = await Category.find().populate("questions");

          // count of questions in each category
          let noOfQuestionPerCat = categories.map((category) => {
            return category.questions.length;
          });

          // count of each category question. i.e total questions in database.
          let noOfQuestions = noOfQuestionPerCat.reduce((a, b) => {
            return a + b;
          });
          const noOfQuestionForExam = noOfQuestions < 150 ? 8 : 150;
          let sum = 0;

          // questions from each category i.e: no of questions
          let noOfQuestionFromEachCat = noOfQuestionPerCat.map(
            (count, index) => {
              // percentage of current category questions
              let percentage = Math.round(
                (noOfQuestionForExam / noOfQuestions) * 100
              );

              let no = Math.round((percentage / 100) * count);
              sum += no;

              // if the index is last then...
              if (index == noOfQuestionPerCat.length - 1) {
                /* if the subtraction of both sum and noOfQuestionForExam
                 * is less the zero then add Absolute value to no.
                 * i.e -1 then add 1 to n.
                 */
                if (sum - noOfQuestionForExam < 0) {
                  no += Math.abs(sum - noOfQuestionForExam);
                } else if (sum - noOfQuestionForExam > 0) {
                  no -= Math.abs(sum - noOfQuestionForExam);
                }
              }
              return no;
            }
          );
          let allQuestions = [];
          categories.map((category, index) => {
            // getting questions from each category according to its percentage.
            let eachCatQuestions = category.questions.slice(
              0,
              noOfQuestionFromEachCat[index]
            );
            allQuestions = [...allQuestions, ...eachCatQuestions];
          });
          test = {
            name: "Master Exam",
            exam: "master",
            questions: allQuestions,
          };
          testByCategory = false;
        } else {
          test = await Quiz.findById(id).populate("questions");
          test.name = test.title;
          testByCategory = false;
        }
      }

      // add serial no to each question
      test.questions.map((question, index) => {
        test.questions[index].qno = `q-${index}`;
        questionsID.push(question._id);
      });

      res.render("dashboard/student/salesperson/takeTest", {
        title: req.query.exam == "true" ? "Master Exam" : "Test",
        result: false,
        testByCategory,
        test,
        questionsID,
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async takeQuizPost(req, res) {
    try {
      const time = req.body.time;
      const ID = req.body.testId;
      const categoryTest = req.body.byCategory;
      const exam = req.body.exam;
      const examQuestions = req.body.questions.split(",");
      let questions, grade, percent;
      let quiz, modelName;

      // categoryTest value form req.body is in string
      if (exam != "master") {
        if (categoryTest == "true") {
          modelName = "Sp_category";
          quiz = await Category.findById(ID).populate("questions");
        } else {
          modelName = "Sp_quiz";
          quiz = await Quiz.findById(ID).populate("questions");
        }
        questions = quiz.questions;
      }
      // deleting the quizId & time so that the req.body only contain answer
      delete req.body.testId;
      delete req.body.time;
      delete req.body.byCategory;
      delete req.body.exam;
      delete req.body.questions;

      let answersArr = Object.values(req.body);
      let point = 0;
      let wrongAns = [];
      let wrongQuestionID = [];
      let correctAns = [];
      let correctQuestionID = [];
      let showAns = [];
      let explain = [];

      if (exam == "master" && req.body) {
        questions = Object.entries(req.body); // output: [['id','value'],[],[]...]

        for await (let [index, question] of questions.entries()) {
          let dbQuestion = await Question.findById(question[0]);
          if (dbQuestion.ans == question[1]) {
            point += 1;
            correctQuestionID.push(dbQuestion._id);
          } else {
            wrongQuestionID.push(dbQuestion._id);
          }
        }
      } else {
        questions.forEach((question, index) => {
          // explanation of the question for the client side js
          explain.push({ question: `q-${index}`, explain: question.explain });
          if (question.ans == answersArr[index]) {
            point += 1;
            correctAns.push(`q-${index}`);
            correctQuestionID.push(question._id);
          } else {
            wrongAns.push(`q-${index}`);
            // add the correct ans to array for this question i.e: q-0-op-0
            showAns.push(`q-${index}-op-${question.ans}`);
            wrongQuestionID.push(question._id);
          }
        });
        // passing for marks from database
        let passingMark = 40;

        percent = Math.floor((point / questions.length) * 100);
        grade = percent >= passingMark ? "passed" : "failed";
      }
      const data = {
        user: req.user._id,
        points: point,
        correct_ans: correctQuestionID,
        wrong_ans: wrongQuestionID,
        totalQuestions: questions.length,
        time,
        grade,
        examQuestions,
        percent,
        ans: req.body,
      };

      if (exam == "master") {
        data.test = [{ _id: "master exam" }];
        // data.test.modelType = "master exam";
        data.totalQuestions = examQuestions.length;
        await Result(data).save();
      } else {
        data.test = [{ _id: quiz._id, model: modelName }];
        let alreadyTaken = await Result.findOne({
          test: { $elemMatch: { _id: mongoose.Types.ObjectId(ID) } },
          user: req.user._id,
        });
        if (alreadyTaken) {
          delete data.test;
          delete data.user;
          await Result.findByIdAndUpdate(alreadyTaken._id, data);
        } else {
          await Result(data).save();
        }
      }
      // sending object to client side javascript
      let sendObj = {
        point,
        showAns,
        correctAns,
        wrongAns,
        correctCount: correctAns.length,
        wrongCount: wrongAns.length,
        percent,
        grade,
        explain,
      };
      // if master exam then redirect to result page
      exam == "master"
        ? (sendObj.redirectTo = "/dashboard/salesperson/exam-result")
        : "";
      res.send(sendObj);
    } catch (error) {
      res.send({ error: error.message });
    }
  },
  async addBySelect(req, res) {
    try {
      const allQuestions = await Question.find();
      res.render("dashboard/examples/salesperson/quiz/add-by-select", {
        title: "Add Test",
        allQuestions,
      });
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/all-tests?msg=" + encodeMsg(error.message)
      );
    }
  },
  async postBySelect(req, res) {
    try {
      const data = req.body;
      let quizObj = {
        title: data.name,
        questions: data.questions,
      };
      let addQuiz = await Quiz(quizObj).save();
      if (addQuiz) {
        return res.redirect(
          "/dashboard/salesperson/all-tests?msg=" +
            encodeMsg("Quiz added Successfully.")
        );
      }
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-tests?msg=" +
          encodeMsg(error.message, "danger")
      );
    }
  },
};
