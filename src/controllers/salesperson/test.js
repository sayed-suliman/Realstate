const { encodeMsg } = require("../../helper/createMsg");
const Category = require("../../models/salesperson/category");

module.exports = {
  async tests(req, res) {
    try {
      res.render("dashboard/examples/salesperson/tests/test", {
        title: "Test",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async testsResult(req, res) {
    try {
      res.render("dashboard/examples/salesperson/tests/test", {
        result: true,
        title: "Test",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async takeTest(req, res) {
    try {
      const id = req.query.id;
      const test = await Category.findById(id).populate("questions");
      // add serial no to question
      for await (let [index, question] of test.questions.entries()) {
        test.questions[index].qno = `q-${index}`;
      }

      res.render("dashboard/student/salesperson/takeTest", {
        title: "Tests",
        result: false,
        test,
      });
    } catch (error) {
      console.log('reopen')
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async takeTestPost(req, res) {
    try {
      const time = req.body.time;
      const quiz = await Category.findById(req.body.quizId);
      const questions = quiz.questions;
      console.log(req.body);
      // deleting the quizId & time so that the req.body only contain answer
      delete req.body.quizId;
      delete req.body.time;

      let answersArr = Object.values(req.body);
      let point = 0;
      let wrongAns = [];
      let correctAns = [];
      let showAns = [];
      questions.forEach((question, index) => {
        if (question.ans == answersArr[index]) {
          point += 1;
          correctAns.push(`q-${index}`);
        } else {
          wrongAns.push(`q-${index}`);
          // add the correct ans to array for this question i.e: q-0-op-0
          showAns.push(`q-${index}-op-${question.ans}`);
        }
      });
      // passing for marks from database
      let passingMark;

      const percent = Math.floor((point / questions.length) * 100);
      const grade = percent >= passingMark ? "passed" : "failed";

      const data = {
        quiz: quiz._id,
        user: req.user._id,
        points: point,
        correct_ans: correctAns,
        wrong_ans: wrongAns,
        totalQuestions: questions.length,
        time,
        grade,
        ans: req.body,
      };
      const alreadyTakenQuiz = await Result.findOne({
        quiz: quiz._id,
        user: req.user._id,
      });
      // -1 is for unlimited
      let noOfRetake = -1;
      if (quiz.type == "mid") {
        noOfRetake = setting.midRetake;
      } else if (quiz.type == "final") {
        noOfRetake = setting.finalRetake;
      }
      let retake = true;
      if (alreadyTakenQuiz) {
        delete data.quiz;
        delete data.user;
        const updatedQuiz = await Result.findOneAndUpdate(
          {
            quiz: quiz._id,
            user: req.user._id,
          },
          {
            ...data,
            take: alreadyTakenQuiz.take + 1,
          },
          { new: true }
        );
        // only for mid and final term
        if (quiz.type != "quiz") {
          retake = !(updatedQuiz.take >= noOfRetake);
        }
      } else {
        const newQuiz = await Result({ ...data, take: 1 }).save();
        // only for mid and final term
        if (quiz.type != "quiz") {
          retake = !(newQuiz.take >= noOfRetake);
        }
      }
      // sending object to client side javascript
      sendObj = {
        point,
        showAns,
        correctAns,
        wrongAns,
        correctCount: correctAns.length,
        wrongCount: wrongAns.length,
      };

      res.send(sendObj);
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
};
