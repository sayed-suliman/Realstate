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
    const onTrail = !!data.trial;
    delete data.name;
    delete data.course;
    delete data.type;
    delete data.trail;
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
      onTrail,
    }).save();
    if (quizAdded) {
      course.quizzes.push(quizAdded._id);
      await course.save();
      var msg = encodeMsg("Your Quiz has been added Successfully");
      res.redirect("/dashboard/add-quiz?msg=" + msg);
    }
  } catch (e) {
    res.redirect("/dashboard?msg=" + encodeMsg(e.message, "danger"));
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
    res.redirect("/dashboard?msg=" + encodeMsg(e.message, "danger"));
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
    const onTrial = data.trial;
    delete data.name;
    delete data.course;
    delete data.type;
    delete data.trail;
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
      onTrial,
      course: afterCourse._id,
    });
    if (!(oldCourse.name == afterCourse.name)) {
      // here
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
    res.redirect("/dashboard?msg=" + encodeMsg(e.message, "danger"));
  }
};

// Student view
const viewQuiz = async (req, res) => {
  try {
    const QuizId = req.params.id;
    const courseId = req.params.courseId;
    const quiz = await Quiz.findById(QuizId);
    let course = await Course.findById(courseId);
    if (quiz && course) {
      await req.user.populate("package");
      let userPackage = req.user.package;
      // authorized to purchase package quizzes
      if (
        userPackage.courses.includes(course._id) &&
        course.quizzes.includes(quiz._id)
      ) {
        await course.populate("chapters");
        await course.populate("quizzes");
        const setting = await Setting.findOne();
        const takenQuiz = await Result.findOne({
          quiz: quiz._id,
          user: req.user._id,
        });
        // adding percentage when the user have taken the quiz
        if (takenQuiz) {
          takenQuiz["percent"] = Math.floor(
            (Number(takenQuiz.points) / Number(takenQuiz.totalQuestions)) * 100
          );
        }
        const courseMeta = await UserMeta.findOne({
          user_id: req.user._id,
          course: courseId,
        });

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
                  if (contents[index - 1].type == "quiz") {
                    if (contents[index - 1].grade == "failed") {
                      break;
                    }
                  }
                  if (contents[index - 1].unlock) {
                    contents[index].unlock = true;

                    // lock system for final term when days are in database
                    if (
                      contents[index].type == "final" &&
                      setting.finalDay != -1 &&
                      courseMeta
                    ) {
                      // date of agreement
                      let agreementDate = new Date(courseMeta.createdAt);

                      // Day and Minute from database
                      let unlockAfterDay = setting.finalDay;
                      let unlockAfterTime = setting.finalTime;

                      // adding day and minute to the agreement date
                      let final = new Date(
                        agreementDate.getFullYear(),
                        agreementDate.getMonth(),
                        agreementDate.getDate() + unlockAfterDay,
                        agreementDate.getHours(),
                        agreementDate.getMinutes() + unlockAfterTime
                      );
                      let now = new Date();
                      let unlock = now > final;
                      contents[index].unlock = unlock;
                    }
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
            if (!contents[index].unlock) {
              contents[index].unlock = true;
            }
            // lock system for final term when days are in database
            if (
              setting.finalDay != -1 &&
              contents[index].type == "final" &&
              courseMeta
            ) {
              // date of agreement
              let agreementDate = new Date(courseMeta.createdAt);

              // Day and Minute from database
              let unlockAfterDay = setting.finalDay;
              let unlockAfterTime = setting.finalTime;

              // adding day and minute to the agreement date
              let final = new Date(
                agreementDate.getFullYear(),
                agreementDate.getMonth(),
                agreementDate.getDate() + unlockAfterDay,
                agreementDate.getHours(),
                agreementDate.getMinutes() + unlockAfterTime
              );
              let now = new Date();
              let unlock = now > final;
              contents[index].unlock = unlock;
            }
          }
        }

        // add serial no to question
        for await (let [index, question] of quiz.questions.entries()) {
          quiz.questions[index].qno = `q-${index}`;
        }
        // randomizing the question
        if (setting.randomizeQuestions) {
          quiz.questions.sort(() => {
            return Math.random() - 0.5;
          });
        }

        let passingPercent;
        if (quiz.type == "quiz") {
          passingPercent = setting.quizPassingMark;
        } else if (quiz.type == "mid") {
          passingPercent = setting.midPassingMark;
        } else if (quiz.type == "final") {
          passingPercent = setting.finalPassingMark;
        }

        let retake = true;
        if (takenQuiz) {
          if (quiz.type == "mid") {
            retake = !(setting.midRetake == takenQuiz.take);
          } else if (quiz.type == "final") {
            retake = !(setting.finalRetake == takenQuiz.take);
          }
        }
        res.render("dashboard/student/view-quiz", {
          title: `Quiz | ${quiz.name}`,
          quiz,
          takenQuiz,
          passingPercent,
          reviewQuiz: setting.reviewQuiz,
          courseId: course._id.toString(),
          contents,
          retake,
          timeForExam: {
            final: setting.finalTakeTime,
            mid: setting.midTakeTime,
          },
        });
      } else {
        return res.redirect(
          "/dashboard?msg=" + encodeMsg("Unauthorized Access", "danger")
        );
      }
    } else {
      res.redirect("/dashboard?msg=" + encodeMsg("Quiz not found.", "danger"));
    }
  } catch (error) {
    res.redirect("/dashboard?msg=" + encodeMsg(error.message, "danger"));
  }
};

const takeQuiz = async (req, res) => {
  try {
    const time = req.body.time;
    const user = req.body.user;
    const quiz = await Quiz.findById(req.body.quizId);
    const questions = quiz.questions;
    const setting = await Setting.findOne();

    // deleting the quizId & time so that the req.body only contain answer
    delete req.body.quizId;
    delete req.body.time;
    delete req.body.user;

    if (setting.randomizeQuestions) {
      // sort the object by property and return back an object
      req.body = Object.entries(req.body)
        .sort(([a], [b]) => {
          return a.slice(2) > b.slice(2) ? 1 : -1;
        })
        .reduce((prev, [prop, val]) => ({ ...prev, [prop]: val }), {});
    }

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
    if (quiz.type == "quiz") {
      passingMark = setting.quizPassingMark;
    } else if (quiz.type == "mid") {
      passingMark = setting.midPassingMark;
    } else if (quiz.type == "final") {
      passingMark = setting.finalPassingMark;
    }
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

    // saving the result when the user is not guest
    //i.e guest for the trial user
    if (user != "guest") {
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
    }
    // sending object to client side javascript
    // 1) if reviewQuiz is enable
    //      send both correct and wrong answer of the user
    // 2) if reviewQuiz and showAnswer both are enable
    //      send correct and wrong answer of the user and correctAns of the question
    // 3) other wise send only marks(points) + correct and wrong counts
    sendObj = setting.reviewQuiz
      ? setting.showAnswer
        ? { showAns, correctAns, wrongAns, point, retake }
        : { correctAns, wrongAns, point, retake }
      : {
          point,
          correctCount: correctAns.length,
          wrongCount: wrongAns.length,
          retake,
        };

    res.send(sendObj);
  } catch (error) {
    res.redirect("/dashboard?msg=" + encodeMsg(error.message, "danger"));
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
