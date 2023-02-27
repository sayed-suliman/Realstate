const Package = require("../models/package");
const CourseModel = require("../models/courses");
const Result = require("../models/result");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const url = require("url");
const UserMeta = require("../models/user-meta");
const Setting = require("../models/setting");
const fs = require("fs");
const { sendAgreement } = require("./mailServices");

const course = async (req, res) => {
  try {
    var msgToken = req.query.msg;
    var msg = {};
    if (msgToken) {
      msg = decodeMsg(msgToken);
    }
    // all added packages
    const packages = await Package.find({ status: "publish" });
    res.render("dashboard/examples/courses/add-course", {
      title: "Dashboard | Add Course",
      packages,
      toast: Object.keys(msg).length == 0 ? undefined : msg,
    });
  } catch (e) {
    let msg = encodeMsg(e.message, "danger");
    res.redirect("/dashboard/add-course?msg=" + msg);
  }
};
// Add Course or post
const addcourse = async (req, res) => {
  try {
    const data = await req.body;
    // const
    const package = await Package.find({ name: req.body.package }).select(
      "_id"
    );
    let courseData = {
      name: data.name,
      description: data.description,
      status: data.status,
      package: package,
      price: data.price,
    };
    if (req.file) {
      courseData.banner = req.file.filename;
    }
    const addCourse = await CourseModel(courseData).save();
    if (addCourse) {
      if (data.package) {
        if (Array.isArray(data.package)) {
          data.package.forEach(async (packageName) => {
            let packageCourse = await Package.findOne({ name: packageName });
            let courseId = await CourseModel.findOne({
              name: data.name,
            }).select("_id");
            packageCourse.courses = packageCourse.courses.concat(courseId);
            await packageCourse.save();
            return;
          });
        } else {
          let packageCourse = await Package.findOne({ name: data.package });
          let courseId = await CourseModel.findOne({ name: data.name }).select(
            "_id"
          );
          packageCourse.courses = packageCourse.courses.concat(courseId);
          await packageCourse.save();
        }
      }
      var msg = encodeMsg("The Course has been created");
      return res.redirect("/dashboard?msg=" + msg);
    }
  } catch (e) {
    var msg = encodeMsg("Some error while creating Course.", "danger", "500");
    return res.redirect("/dashboard?msg=" + msg);
  }
};

// course details
const courseDetails = async (req, res) => {
  try {
    const allCourses = await CourseModel.find().populate("package");
    var msgToken = req.query.msg;
    var option = {};
    if (msgToken) {
      var msg = decodeMsg(msgToken);
      option = msg;
    }
    res.render("dashboard/examples/courses/course-detail", {
      title: "Dashboard | Course Detail",
      allCourses,
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  } catch (e) {
    let msg = encodeMsg(e.message, "danger");
    res.redirect("/dashboard/course-detail?msg=" + msg);
  }
};
// editCourse
const editCourse = async (req, res) => {
  try {
    let courseId = req.query.cId;
    const course = await CourseModel.findById(courseId).populate("package");
    const packages = await Package.find({ status: "publish" });
    res.render("dashboard/examples/courses/course-edit", {
      title: "Dashboard | Edit Course",
      packages,
      course,
    });
  } catch (e) {
    res.render("500");
  }
};
// update course
// update
const updateCourse = async (req, res) => {
  try {
    const data = req.body;
    const cId = req.query.cId;
    const course = await CourseModel.findById(req.query.cId);
    const packages = await Package.find({ name: req.body.package }).select(
      "_id"
    );
    const packageId = await Package.findOne({ name: data.package });
    const allPackages = await Package.find();
    const oldPath = course.banner;
    if (req.file) {
      data.banner = req.file.filename;
    }
    await course.updateOne({
      ...data,
      package: packages,
    });
    fs.unlink("public/images/course" + oldPath, (err, data) => {
      console.log("Course File Deleted.");
    });
    if (course) {
      if (!data.package) {
        allPackages.forEach(async (onePackage) => {
          const index = onePackage.courses.indexOf(cId);
          onePackage.courses.splice(index, 1);
          await onePackage.save();
        });
      }
      if (data.package) {
        if (Array.isArray(data.package)) {
          allPackages.forEach(async (pk) => {
            const index = pk.courses.indexOf(cId);
            let isPackageContain = data.package.includes(pk.name);
            if (isPackageContain) {
              if (!(index > -1)) {
                pk.courses = pk.courses.concat(cId);
              }
            } else {
              if (index > -1) {
                pk.courses.splice(index, 1);
              }
            }
            await pk.save();
          });
        } else {
          allPackages.forEach(async (eachPackage) => {
            if (eachPackage.name === data.package) {
              let courseIndex = eachPackage.courses.indexOf(cId);
              if (!(courseIndex > -1)) {
                eachPackage.courses = eachPackage.courses.concat(cId);
                await eachPackage.save();
              }
              return;
            } else {
              let courseIndex = eachPackage.courses.indexOf(cId);
              if (courseIndex > -1) {
                eachPackage.courses.splice(courseIndex, 1);
                await eachPackage.save();
              }
            }
          });
        }
      }
      var msg = encodeMsg("Course Updated");
      return res.redirect("/dashboard/course-detail?msg=" + msg);
    }
  } catch (e) {
    // res.render('404')

    // testing purpose
    res.status(404).json({
      err: e.message,
      status: 404,
    });
  }
};

// delete Course
// Chapter Delete
const deleteCourse = async (req, res) => {
  try {
    const id = await req.query.cId;
    const course = await CourseModel.findById(id);
    await course.remove();
    var msg = encodeMsg("Course Deleted", (type = "danger"), (status = 404));
    res.redirect("/dashboard/course-detail?msg=" + msg);
    // const chapterData =
  } catch (e) {
    res.render("500.hbs");
  }
};

// Student all courses
var allCourses = async (req, res) => {
  try {
    await req.user.populate([
      {
        path: "packages",
        populate: { path: "courses", match: { status: "publish" } },
      },
      { path: "courses", match: { status: "publish" } },
    ]);
    let userCourses = [];
    let progress = {};

    if (req.user.role === "guest") {
      await req.user.populate({ path: "trialCourse" });
      userCourses = [req.user.trialCourse];
      let courseMeta = await UserMeta.find({
        user_id: req.user._id,
      });

      // removing the duplicate courses
      userCourses = [
        ...new Set(userCourses.map((course) => JSON.stringify(course))),
      ].map((course) => JSON.parse(course));
      for await (let [index, content] of userCourses.entries()) {
        // used for to find the content(chap+quiz) length
        let total = 0;

        for await (let chapter of content.chapters) {
          const completedChap = await UserMeta.findOne({
            chapter_id: chapter.toString(),
            user_id: req.user._id,
            meta_key: "completed",
          });
          if (completedChap) {
            progress[content.name] = (progress[content.name] || 0) + 1;
          }
          total++;
        }
        for await (let quiz of content.quizzes) {
          const takenQuiz = await Result.findOne({
            user: req.user._id,
            quiz: quiz.toString(),
          });
          if (takenQuiz) {
            progress[content.name] = (progress[content.name] || 0) + 1;
          }
          total++;
        }
        if (progress[content.name]) {
          let percent = Math.floor((progress[content.name] / total) * 100);
          progress[content.name] = percent;
          userCourses[index].unlock = percent == 100 ? true : false;
        }
      }

      let setting = await Setting.findOne();
      // unlock course when previous is completed
      if (setting.unlockCourse) {
        if (userCourses.length) {
          for await (let [index] of userCourses.entries()) {
            if (!userCourses[index].unlock) {
              if (index == 0) continue;
              if (typeof userCourses[index - 1].unlock != undefined) {
                if (userCourses[index - 1].unlock) {
                  userCourses[index].unlock = true;
                  break;
                }
              }
            }
          }
          // unlock the first content of the current chapter
          Object.assign(userCourses[0], { unlock: true });
        }
      } else {
        for await (let [index] of userCourses.entries()) {
          Object.assign(userCourses[index], { unlock: true });
        }
      }

      // filtering only courses meta
      courseMeta = courseMeta.filter((el) => el.course != undefined);
      //   check that user accept the agreement or not
      userCourses.forEach((course, index) => {
        courseMeta.forEach((startedCourse) => {
          if (course._id.toString() == startedCourse.course.toString()) {
            userCourses[index].started = true;
          }
        });
      });
    }

    if (req.user.role === "student") {
      if (req.user.packages) {
        req.user.packages.map((package) => {
          if (package.salesperson) {
            req.user.salesperson = true;
          }
          userCourses = [...userCourses, ...package.courses];
        });
      }
      if (req.user.courses) {
        userCourses = [...userCourses, ...req.user.courses];
      }
      let courseMeta = await UserMeta.find({
        user_id: req.user._id,
      });

      // removing the duplicate courses
      userCourses = [
        ...new Set(userCourses.map((course) => JSON.stringify(course))),
      ].map((course) => JSON.parse(course));
      for await (let [index, content] of userCourses.entries()) {
        // used for to find the content(chap+quiz) length
        let total = 0;

        for await (let chapter of content.chapters) {
          const completedChap = await UserMeta.findOne({
            chapter_id: chapter.toString(),
            user_id: req.user._id,
            meta_key: "completed",
          });
          if (completedChap) {
            progress[content.name] = (progress[content.name] || 0) + 1;
          }
          total++;
        }
        for await (let quiz of content.quizzes) {
          const takenQuiz = await Result.findOne({
            user: req.user._id,
            quiz: quiz.toString(),
          });
          if (takenQuiz) {
            progress[content.name] = (progress[content.name] || 0) + 1;
          }
          total++;
        }
        if (progress[content.name]) {
          let percent = Math.floor((progress[content.name] / total) * 100);
          progress[content.name] = percent;
          userCourses[index].unlock = percent == 100 ? true : false;
        }
      }

      let setting = await Setting.findOne();
      // unlock course when previous is completed
      if (setting.unlockCourse) {
        if (userCourses.length) {
          for await (let [index] of userCourses.entries()) {
            if (!userCourses[index].unlock) {
              if (index == 0) continue;
              if (typeof userCourses[index - 1].unlock != undefined) {
                if (userCourses[index - 1].unlock) {
                  userCourses[index].unlock = true;
                  break;
                }
              }
            }
          }
          // unlock the first content of the current chapter
          if(userCourses.length > 0){
            Object.assign(userCourses[0], { unlock: true });
          }
        }
      } else {
        for await (let [index] of userCourses.entries()) {
          Object.assign(userCourses[index], { unlock: true });
        }
      }

      // filtering only courses meta
      courseMeta = courseMeta.filter((el) => el.course != undefined);
      //   check that user accept the agreement or not
      userCourses.forEach((course, index) => {
        courseMeta.forEach((startedCourse) => {
          if (course._id.toString() == startedCourse.course.toString()) {
            userCourses[index].started = true;
          }
        });
      });
    }

    if (req.user.role === "regulator") {
      userCourses = await CourseModel.find({ status: "publish" });
    }
    res.render("dashboard/examples/courses/course-detail", {
      title: "Dashboard | All Courses",
      userCourses,
      progress,
    });
  } catch (e) {
    console.log(e.message);
    res.redirect(
      url.format({
        pathname: "/dashboard",
        query: {
          msg: encodeMsg(e.message, "danger"),
        },
      })
    );
    // res.render("404")
  }
};
//for the student view
var viewCourse = async (req, res) => {
  try {
    // for regulator
    if (req.user.role === "regulator") {
      const ID = req.params.id;
      const course = await CourseModel.findById(ID)
        .populate("chapters")
        .populate("quizzes")
        .lean();

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
      if (course) {
        // sorting the chapter by name
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

        if (contents.length) {
          for await (let [index] of contents.entries()) {
            if (!contents[index].unlock) {
              if (index == 0) continue;
              if (typeof contents[index - 1].unlock != undefined) {
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
        return res.render("dashboard/student/view-course", {
          title: `Course | ${course.name}`,
          title: course.name,
          contents,
        });
      }
    }
    // regulator end
    if (req.user.role === "guest") {
      // student start
      const ID = req.params.id;
      const course = await CourseModel.findById(ID)
        .populate("chapters")
        .populate("quizzes")
        .lean();
      if (course) {
        // authorized to purchase course of package or course
        if (req.user.trialCourse.toString() == course._id.toString()) {
          const courseMeta = await UserMeta.findOne({
            user_id: req.user._id,
            course: ID,
          });
          if (req.query.agree) {
            if (!courseMeta) {
              await UserMeta({
                user_id: req.user._id,
                course: ID,
                meta_key: "Course Start Agreement",
                meta_value: "Accepted",
              }).save();
              sendAgreement(req.user.email, req.user.name);
            }
          }
          for await (let [index, quiz] of course.quizzes.entries()) {
            Object.assign(course.quizzes[index], { unlock: false });

            const takenQuiz = await Result.findOne({
              user: req.user._id,
              quiz: quiz._id,
            });
            if (takenQuiz) {
              Object.assign(course.quizzes[index], { grade: takenQuiz.grade });
              Object.assign(course.quizzes[index], { unlock: true });
            }
            if (quiz.onTrial) {
              Object.assign(course.quizzes[index], { unlock: true });
            }
          }

          for await (let [index, chapter] of course.chapters.entries()) {
            Object.assign(course.chapters[index], { unlock: false });
            const completedChapter = await UserMeta.findOne({
              user_id: req.user._id.toString(),
              chapter_id: chapter,
              meta_key: "completed",
            });
            if (completedChapter) {
              Object.assign(course.chapters[index], { completed: true });
              Object.assign(course.chapters[index], { unlock: true });
            }
            if (chapter.onTrial) {
              Object.assign(course.chapters[index], { unlock: true });
            }
          }

          // sorting the chapter by name
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
                      break;
                    }
                  }
                }
              }
              // unlock the first content of the current chapter
              Object.assign(contents[0], { unlock: true });
            }
          }
          return res.render("dashboard/student/view-course", {
            title: `Course | ${course.name}`,
            course,
            contents,
            timeForExam: {
              final: setting.finalTakeTime,
              mid: setting.midTakeTime,
            },
          });
        } else {
          return res.redirect(
            url.format({
              pathname: "/dashboard",
              query: {
                msg: encodeMsg("Unauthorized Access", "danger"),
              },
            })
          );
        }
      } else {
        res.redirect(
          "/dashboard?msg=" + encodeMsg("Course not found.", "danger")
        );
      }
    }
    // student start
    const ID = req.params.id;
    const course = await CourseModel.findById(ID)
      .populate("chapters")
      .populate("quizzes")
      .lean();
    if (course) {
      let userCourses = [];
      if (req.user.packages) {
        await req.user.populate("packages");
        req.user.packages.map((package) => {
          return (userCourses = [...userCourses, ...package.courses]);
        });
      }
      if (req.user.courses.length) {
        userCourses = [...userCourses, ...req.user.courses];
      }
      // courses from mongoose id to string
      userCourses = userCourses.map((el) => el.toString());
      // authorized to purchase course of package or course
      if (userCourses.includes(course._id.toString())) {
        const courseMeta = await UserMeta.findOne({
          user_id: req.user._id,
          course: ID,
        });
        if (req.query.agree) {
          if (!courseMeta) {
            await UserMeta({
              user_id: req.user._id,
              course: ID,
              meta_key: "Course Start Agreement",
              meta_value: "Accepted",
            }).save();
            sendAgreement(req.user.email, req.user.name);
          }
        }
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

        // sorting the chapter by name
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
            // final term unlock algorithm
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
        return res.render("dashboard/student/view-course", {
          title: `Course | ${course.name}`,
          course,
          contents,
          timeForExam: {
            final: setting.finalTakeTime,
            mid: setting.midTakeTime,
          },
        });
      } else {
        return res.redirect(
          url.format({
            pathname: "/dashboard",
            query: {
              msg: encodeMsg("Unauthorized Access", "danger"),
            },
          })
        );
      }
    } else {
      res.redirect(
        "/dashboard?msg=" + encodeMsg("Course not found.", "danger")
      );
    }
  } catch (err) {
    console.log("Courses Error:", err.message);
    if (err.message.includes("ObjectId failed")) {
      return res.redirect(
        url.format({
          pathname: "/dashboard",
          query: {
            msg: encodeMsg("Course Id doesn't exist.", "danger"),
          },
        })
      );
    }
    res.redirect(
      url.format({
        pathname: "/dashboard",
        query: {
          msg: encodeMsg(err.message, "danger"),
        },
      })
    );
  }
};
var courseError = (error, req, res, next) => {
  console.log(error.message);
  var msg = encodeMsg(error.message, "danger", 500);
  res.redirect("/dashboard/add-course?msg=" + msg);
};

module.exports = {
  course,
  addcourse,
  courseDetails,
  deleteCourse,
  editCourse,
  updateCourse,
  allCourses,
  viewCourse,
  courseError,
};
