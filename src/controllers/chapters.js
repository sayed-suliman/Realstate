const Course = require("./../models/courses");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Chapters = require("./../models/chapters");
const fs = require("fs");
const userMeta = require("../models/user-meta");
const CourseModel = require("../models/courses");
const UserMeta = require("../models/user-meta");
const Setting = require("../models/setting");
const Result = require("../models/result");

// chpaters detail
const chapterDetail = async (req, res) => {
  // const allChaptersDetails = Chapters.find()
  var msgToken = req.query.msg;
  var option = {};
  if (msgToken) {
    var msg = decodeMsg(msgToken);
    option = msg;
  }
  const chapters = await Chapters.find().populate("course");
  res.render("dashboard/examples/chapter/chapter-details", {
    title: "Dashboard | Chapters Detail",
    chapters,
    toast: Object.keys(option).length == 0 ? undefined : option,
  });
};

// addChapter get
const addChapter = async (req, res) => {
  try {
    var msgToken = req.query.msg;
    var option = {};
    if (msgToken) {
      var msg = decodeMsg(msgToken);
      option = msg;
    }
    const courses = await Course.find({ status: "publish" });
    res.render("dashboard/examples/chapter/add-chapter", {
      courses,
      title: "Dashboard | Add Chapter",
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  } catch (e) {
    var msg = encodeMsg(e.message);
    return res.redirect("/dashboard?msg=" + msg);
  }
};
// add Chapter post
const postChapter = async (req, res) => {
  try {
    const data = await req.body;
    const fileName = "uploaded-media/" + req.file.filename;
    const courseId = await Course.findOne({ name: data.course });
    const chapterAdded = Chapters({
      name: data.name,
      fileName: req.file.originalname,
      path: fileName,
      course: courseId._id,
      onTrial: !!data.trial,
    });
    await chapterAdded.save();
    if (chapterAdded) {
      courseId.chapters.push(chapterAdded._id);
      await courseId.save();
    }

    var msg = encodeMsg("Your Chapter has been added");
    return res.redirect("/dashboard?msg=" + msg);
  } catch (e) {
    var msg = encodeMsg(e.message);
    return res.redirect("/dashboard?msg=" + msg);
  }
};

// Chapter Delete
const deleteChapter = async (req, res) => {
  try {
    const id = await req.query.cId;
    const chapter = await Chapters.findById(id);
    await chapter.remove();
    fs.unlink("public/" + chapter.path, (err, data) => {});
    var msg = encodeMsg("Chapter Deleted", (type = "danger"), (status = 404));
    res.redirect("/dashboard/chapter-detail?msg=" + msg);
    // const chapterData =
  } catch (e) {
    res.render("500.hbs");
  }
};
// edit chapter
const editChapter = async (req, res) => {
  try {
    let chapterId = req.query.cId;
    const chapter = await Chapters.findById(chapterId).populate("course");
    const courses = await Course.find({ status: "publish" });
    res.render("dashboard/examples/chapter/chapter-edit", {
      courses,
      chapter,
      title: "Dashboard | Edit Chapter",
    });
  } catch (e) {
    res.status(503).json({
      msg: e.message,
      status: 503,
    });
  }
};
// update
const updateChapter = async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    const cId = req.query.cId;
    const chapter = await Chapters.findById(cId);
    const beforeCourse = await Course.findById(chapter.course);
    const courseId = await Course.findOne({ name: data.course });
    let beforeIndex = beforeCourse.chapters.indexOf(cId);
    let afterIndex = courseId.chapters.indexOf(cId);
    // if we have file than do this operation
    if (req.file) {
      const filePath = "uploaded-media/" + req.file.filename;
      const oldPath = chapter.path;
      await chapter.updateOne({
        name: req.body.name,
        course: courseId._id,
        fileName: req.file.originalname,
        path: filePath,
        onTrial: !!data.trial,
      });
      fs.unlink("public/" + oldPath, (err, data) => {
        console.log("delete", err, data);
      });
      if (!(afterIndex > -1)) {
        courseId.chapters.push(cId);
        await courseId.save();
      }
      if (!(beforeCourse._id.toString() == courseId._id.toString())) {
        if (beforeIndex > -1) {
          beforeCourse.chapters.splice(beforeIndex, 1);
          await beforeCourse.save();
        }
      }
      var msg = encodeMsg("Chapter Updated");
      return res.redirect("/dashboard/chapter-detail?msg=" + msg);
    }

    // if the file is not selected then do this operation
    await chapter.updateOne({
      name: req.body.name,
      course: courseId._id,
      onTrial: !!data.trial,
    });
    if (!(afterIndex > -1)) {
      courseId.chapters.push(cId);
      await courseId.save();
    }
    if (!(beforeCourse._id.toString() == courseId._id.toString())) {
      if (beforeIndex > -1) {
        beforeCourse.chapters.splice(beforeIndex, 1);
        await beforeCourse.save();
      }
    }
    var msg = encodeMsg("Chapter Updated");
    res.redirect("/dashboard/chapter-detail?msg=" + msg);
  } catch (e) {
    res.status(404).json({
      err: e.message,
      status: 404,
    });
  }
};

// for student view
const viewChapter = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await CourseModel.findById(courseId);
    if (course) {
      let userCourses = [];
      let guestUser = false;
      if (req.user.packages.length) {
        await req.user.populate("packages");
        req.user.packages.map((package) => {
          return (userCourses = [...userCourses, ...package.courses]);
        });
      }
      if (req.user.courses.length) {
        userCourses = [...userCourses, ...req.user.courses];
      }

      // pdf view (at right side)
      const ID = req.params.id;
      const chapter = await Chapters.findById(ID).lean();
      const completedChap = await userMeta.findOne({
        user_id: req.user._id,
        chapter_id: chapter._id,
      });
      if (completedChap) {
        chapter.completed = true;
      }
      // courses from mongoose id to string
      userCourses = userCourses.map((el) => el.toString());

      if (req.user.role == "guest") {
        userCourses = [
          await req.user.populate({
            path: "trialCourse",
            match: { status: "publish" },
          }),
        ];
        if (userCourses.length) {
          // access for the guest user to the course
          guestUser = course.chapters.includes(chapter._id);
        }
      }
      // access only the course of the purchased package
      if (
        guestUser ||
        (userCourses.includes(course._id.toString()) &&
          course.chapters.includes(chapter._id))
      ) {
        await course.populate("chapters");
        await course.populate("quizzes");

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
          if (req.user.role === "guest" && quiz.onTrial) {
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
          if (req.user.role === "guest" && chapter.onTrial) {
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
        const setting = await Setting.findOne();
        // quiz policy when completed the the previous
        if (
          setting.quizPolicy == "accessPassedPrevious" &&
          req.user.role != "guest"
        ) {
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
        } else if (
          setting.quizPolicy == "accessAllTime" &&
          req.user.role != "guest"
        ) {
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
        return res.render("dashboard/student/view-chapter", {
          title: `Chapter | ${chapter.name}`,
          chapter,
          courseId: course._id,
          contents,
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
    }

    res.redirect("/dashboard");
  } catch (error) {
    res.redirect("/dashboard?msg=" + encodeMsg(error.message, "danger"));
  }
};
const markAsCompleted = async (req, res) => {
  try {
    const { id: chapterId } = req.body;
    const chapter = await Chapters.findById(chapterId);
    if (chapter) {
      const alreadyCompleted = await userMeta.findOne({
        chapter_id: chapter._id,
        user_id: req.user._id,
      });
      if (!alreadyCompleted) {
        await userMeta({
          user_id: req.user._id,
          chapter_id: chapter._id,
          meta_key: "completed",
          meta_value: "true",
        }).save();
        return res.send({ success: "completed" });
      } else {
        return res.send({ error: "already completed" });
      }
    }
    console.log(chapterId);
    return res.send({ error: "Chapter not found" });
  } catch (error) {
    res.send({ error: error.message });
  }
};

// error msg
const errorMsg = async (error, req, res, next) => {
  console.log("here is ovvur");
  var msg = await encodeMsg(error.message, "danger", 500);
  res.redirect("/dashboard/add-chapter?msg=" + msg);
  // for postman
  // res.status(404).json({
  //     err: error.message
  // })
};

module.exports = {
  addChapter,
  chapterDetail,
  postChapter,
  errorMsg,
  deleteChapter,
  editChapter,
  updateChapter,
  viewChapter,
  markAsCompleted,
};
