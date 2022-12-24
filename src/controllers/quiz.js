const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Course = require("../models/courses");
const Quiz = require("../models/quiz");
const Result = require("../models/result");
const Setting = require("../models/setting");
const UserMeta = require("../models/user-meta");

const quizDetail = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("course");
    var msgToken = req.query.msg;
    var option = {};
    if (msgToken) {
      var msg = decodeMsg(msgToken);
      option = msg;
    }
    res.render("dashboard/examples/quiz/quiz-detail", {
      title: "Dashboard | Detail Quiz",
      quizzes,
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  } catch (e) {
    res.render("500", {
      err: e.message,
    });
  }
};
const addQuiz = async (req, res) => {
  try {
    const courses = await Course.find({ status: "publish" });
    var msgToken = req.query.msg;
    var option = {};
    if (msgToken) {
      var msg = decodeMsg(msgToken);
      option = msg;
    }
    res.render("dashboard/examples/quiz/add-quiz", {
      title: "Dashboard | Add Quiz",
      courses,
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  } catch (e) {
    res.render("500", {
      err: e.message,
    });
  }
};

// post quiz

const postQuiz = async (req, res) => {
  try {
    const fullQuiz = [];
    const data = req.body;
    const course = await Course.findOne({ name: data.course });
    const name = data.name;
    const type = data.type;
    delete data.name;
    delete data.course;
    delete data.type;
    const questions = Object.keys(data).length / 3;
    for (let i = 1; i <= questions; i++) {
      fullQuiz.push({
        question: data[`question-${i}`],
        options: data[`question-${i}-opt`],
        ans: data[`question-${i}-ans`],
      });
    }
    const quizAdded = await Quiz({
      course: course._id,
      name: name,
      type: type,
      questions: fullQuiz,
    }).save();
    if (quizAdded) {
      course.quizzes.push(quizAdded._id);
      await course.save();
      var msg = encodeMsg("Your Quiz has been added Successfully");
      res.redirect("/dashboard/add-quiz?msg=" + msg);
    }
  } catch (e) {
    res.json(404).json({
      msg: e.message,
      status: 404,
    });
  }
};

// edit quiz

const editQuiz = async (req, res) => {
  try {
    let quizId = req.query.qId;
    const quiz = await Quiz.findById(quizId).populate("course");
    const courses = await Course.find({ status: "publish" });
    res.render("dashboard/examples/quiz/quiz-edit", {
      courses,
      quiz,
      title: "Dashboard | Edit Quiz",
    });
  } catch (e) {
    res.render("500", {
      err: e.message,
    });
  }
};

//updateQuizzes
const updateQuiz = async (req, res) => {
  try {
    const fullQuiz = [];
    const data = req.body;
    const qId = req.query.qId;
    const quiz = await Quiz.findById(qId).populate("course");

    // before and after courses to remove id of quiz from old course and add to updated one
    const oldCourse = await Course.findOne({ name: quiz.course.name });
    // for index of quiz in course
    const oldCourseindex = oldCourse.quizzes.indexOf(qId);
    const afterCourse = await Course.findOne({ name: data.course });
    // for index of quiz in after course
    const afterCourseindex = afterCourse.quizzes.indexOf(qId);

    const name = data.name;
    const type = data.type;
    delete data.name;
    delete data.course;
    delete data.type;
    const questions = Object.keys(data).length / 3;
    for (let i = 1; i <= questions; i++) {
      fullQuiz.push({
        question: data[`question-${i}`],
        options: data[`question-${i}-opt`],
        ans: data[`question-${i}-ans`],
      });
    }
    await quiz.updateOne({
      questions: fullQuiz,
      name,
      type,
      course: afterCourse._id,
    });
    if (!(oldCourse.name == afterCourse)) {
      if (oldCourseindex > -1) {
        oldCourse.quizzes.splice(oldCourseindex, 1);
        await oldCourse.save();
      }
      if (!(afterCourseindex > -1)) {
        afterCourse.quizzes.push(qId);
        await afterCourse.save();
      }
    }
    var msg = encodeMsg("Quiz Updated Successfully!");
    res.redirect("/dashboard/quiz-detail?msg=" + msg);
  } catch (e) {
    res.render("404", {
      err: e.message,
    });
  }
};

// Student view
const viewQuiz = async (req, res) => {
  try {
    const id = req.params.id;
    const courseId = req.params.courseId;
    const quiz = await Quiz.findById(id);
    const takenQuiz = await Result.findOne({
      quiz: quiz._id,
      user: req.user._id,
    });
    const course = await Course.findById(courseId)
      .populate("chapters")
      .populate("quizzes")
      .lean();
    const setting = await Setting.findOne();
    if (takenQuiz) {
      takenQuiz["percent"] = Math.floor(
        (Number(takenQuiz.points) / Number(takenQuiz.totalQuestions)) * 100
      );
    }
    if (quiz && course) {
      // unlocking already taken quiz
      for await (let [index, quiz] of course.quizzes.entries()) {
        const takenQuiz = await Result.findOne({
          user: req.user._id,
          quiz: quiz._id,
        });
        if (takenQuiz) {
          Object.assign(course.quizzes[index], { grade: takenQuiz.grade });
          Object.assign(course.quizzes[index], { unlock: true });
        }
      }

      // unlocking completed course
      for await (let [index, chapter] of course.chapters.entries()) {
        const completedChapter = await UserMeta.findOne({
          user_id: req.user._id.toString(),
          chapter_id: chapter,
          meta_key: "completed",
        });
        if (completedChapter) {
          Object.assign(course.chapters[index], { completed: true });
          Object.assign(course.chapters[index], { unlock: true });
        }
      }

      // sorting the contents
      const contents = [...course.quizzes, ...course.chapters];
      contents.sort((a, b) => {
        if (a.order < b.order) {
          return -1;
        }
        if (a.order > b.order) {
          return 1;
        }
        return 0;
      });
      // quiz policy when completed the the previous
      if (setting.quizPolicy == "accessPassedPrevious") {
        // unlocking the next content when the previous is completed
        if (contents.length) {
          for await (let [index] of contents.entries()) {
            if (!contents[index].unlock) {
              if (index == 0) continue;
              if (typeof contents[index - 1].unlock != undefined) {
                //  locking chapter followed by the failed quiz
                if (contents[index - 1].type == "quiz") {
                  if (contents[index - 1].grade == "failed") {
                    break;
                  }
                }
                if (contents[index - 1].unlock) {
                  contents[index].unlock = true;
                  break;
                }
              }
            }
          }
          // unlock the first content of the current chapter
          Object.assign(contents[0], { unlock: true });
        }
      } else if (setting.quizPolicy == "accessAllTime") {
        for await (let [index] of contents.entries()) {
          // unlocking all contents
          if (!contents[index].unlock) {
            contents[index].unlock = true;
          }
        }
      }
      let passingPercent;
      if (quiz.type == "quiz") {
        passingPercent = setting.quizPassingMark;
      } else if (quiz.type == "mid") {
        passingPercent = setting.midPassingMark;
      } else if (quiz.type == "final") {
        passingPercent = setting.finalPassingMark;
      }
      res.render("dashboard/student/view-quiz", {
        title: `Quiz | ${quiz.name}`,
        quiz,
        takenQuiz,
        passingPercent,
        reviewQuiz: setting.reviewQuiz,
        courseId: course._id.toString(),
        contents,
      });
    }
  } catch (error) {
    res.redirect("/dashboard?msg=" + encodeMsg(error.message));
  }
};

const takeQuiz = async (req, res) => {
  try {
    const time = req.body.time;
    const quiz = await Quiz.findById(req.body.quizId);
    const questions = quiz.questions;
    const setting = await Setting.findOne();

    // deleting the quizId & time so that the req.body only contain answer
    delete req.body.quizId;
    delete req.body.time;

    let answersArr = Object.values(req.body);
    console.log(answersArr);
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
      }
    });
    const percent = Math.floor((point / questions.length) * 100);
    const grade = percent >= setting.passingMark ? "passed" : "failed";
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
    if (alreadyTakenQuiz) {
      delete data.quiz;
      delete data.user;
      await alreadyTakenQuiz.updateOne(data);
    } else {
      await Result(data).save();
    }
    // sending object to client side javascript
    // 1) if reviewQuiz is enable
    //      send both correct and wrong answer of the user
    // 2) if reviewQuiz and showAnswer both are enable
    //      send correct and wrong answer of the user and correctAns of the question
    // 3) other wise send only marks(points) + correct and wrong counts

    sendObj = setting.reviewQuiz
      ? setting.showAnswer
        ? { showAns, correctAns, wrongAns, point }
        : { correctAns, wrongAns, point }
      : { point, correctCount: correctAns.length, wrongCount: wrongAns.length };

    res.send(sendObj);
  } catch (error) {
    res.send({ error: error.message });
  }
};

module.exports = {
  quizDetail,
  addQuiz,
  postQuiz,
  editQuiz,
  updateQuiz,
  viewQuiz,
  takeQuiz,
};
