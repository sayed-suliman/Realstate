const Chapters = require("../models/chapters");
const Courses = require("../models/courses");
const Quiz = require("../models/quiz");
const Setting = require("../models/setting");

module.exports = {
  async chapter(req, res) {
    try {
      let { courseID, chapterID } = req.params;

      let chapter = await Chapters.findById(chapterID).lean();
      const course = await Courses.findById(courseID);
      if (course && chapter && chapter.onTrial) {
        await course.populate("chapters");
        await course.populate("quizzes");

        // unlocking only the Trial quiz for the user
        for await (let [index, quiz] of course.quizzes.entries()) {
          if (quiz.onTrial) {
            Object.assign(course.quizzes[index], { unlock: true });
          }
        }

        // unlocking only the trial course for the user
        for await (let [index, chapter] of course.chapters.entries()) {
          if (chapter.onTrial) {
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

        return res.render("trial/view-chapter", {
          title: `Chapter | ${chapter.name}`,
          chapter,
          courseId: course._id,
          contents,
        });
      }
      return res.redirect(req.headers.referer || "/packages");
    } catch (error) {
      res.redirect("/packages");
    }
  },
  async quiz(req, res) {
    try {
      const QuizId = req.params.quizID;
      const courseId = req.params.courseID;
      const quiz = await Quiz.findById(QuizId);
      let course = await Courses.findById(courseId);
      if (quiz && course) {
        await req.user.populate("package");
        await course.populate("chapters");
        await course.populate("quizzes");
        const setting = await Setting.findOne();

        // unlocking trial quiz
        for await (let [index, quiz] of course.quizzes.entries()) {
          if (quiz.onTrial) {
            Object.assign(course.quizzes[index], { unlock: true });
          }
        }

        // unlocking trial course
        for await (let [index, chapter] of course.chapters.entries()) {
          if (chapter.onTrial) {
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
        console.log(course.package)
        res.render("trial/view-quiz", {
          title: `Quiz | ${quiz.name}`,
          quiz,
          passingPercent,
          reviewQuiz: setting.reviewQuiz,
          course,
          contents,
        });
      }
    } catch (error) {
      res.redirect("/packages");
    }
  },
};
