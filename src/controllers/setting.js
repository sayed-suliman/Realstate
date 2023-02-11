const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Setting = require("../models/setting");
const User = require("../models/users");
const sharp = require("sharp");
const bcrypt = require("bcrypt");

module.exports = {
  async settingView(req, res) {
    var msgToken = req.query.msg;
    var msg = {};
    if (msgToken) {
      msg = decodeMsg(msgToken);
    }
    if (req.user.role === "student") {
      return res.render("dashboard/examples/setting", {
        title: "Dashboard | Setting",
        toast: Object.keys(msg).length == 0 ? undefined : msg,
        editUser: req.user,
      });
    }
    res.render("dashboard/examples/setting", {
      title: "Dashboard | Setting",
      toast: Object.keys(msg).length == 0 ? undefined : msg,
      setting: await Setting.findOne(),
    });
  },
  async doSetting(req, res) {
    Date.prototype.getAge = function () {
      const date = new Date();
      const eighteen = date.getFullYear() - 16;
      date.setUTCFullYear(eighteen);
      return date;
    };
    const age = new Date();
    try {
      if (req.user.role == "admin") {
        const {
          stripeSecretKey,
          stripePublishKey,
          paypalClientID,
          paypalClientSecret,
          mailHost,
          mailPort,
          mailUser,
          mailPass,
          mailEmail,
          name,
          address,
          phone,
          quizMarks,
          midMarks,
          finalMarks,
          midRetake,
          finalRetake,
          quizPolicy,
          reviewQuiz,
          showAnswer,
          id,
          randomizeQuestions,
          showFinalDay,
          unlockCourse,
          finalDay,
          finalTime,
        } = req.body;
        if (stripeSecretKey) {
          // check the stripe key is valid or not
          // if invalid then throw error which is handle in catch section
          const stripe = require("stripe")(stripeSecretKey);
          await stripe.customers.list({ limit: 1 });
        }
        // if (stripePublishKey) {
        //   console.log("publish");
        //   // check the stripe key is valid or not
        //   // if invalid then throw error
        //   const stripe = require("stripe")(stripePublishKey);
        //   await stripe.charges.create({
        //     amount: 100,
        //     currency: "usd",
        //     source: "tok_visa",
        //     description: "Test charge",
        //   });
        //   console.log("working");
        // }

        const settingData = {
          collegeName: name,
          collegeAddress: address,
          collegePhone: phone,
          quizPassingMark: quizMarks,
          midPassingMark: midMarks,
          finalPassingMark: finalMarks,
          midRetake,
          finalRetake,
          quizPolicy,
          stripeSecretKey,
          stripePublishKey,
          paypalClientID,
          paypalClientSecret,
          mailHost,
          mailPort,
          mailUser,
          mailPass,
          mailEmail,
          unlockCourse: !!unlockCourse,
          reviewQuiz: !!reviewQuiz,
          showAnswer: !!showAnswer,
          randomizeQuestions: !!randomizeQuestions,
          finalDay: !!showFinalDay ? finalDay : -1,
          finalTime: !!showFinalDay ? finalTime : -1,
        };
        if (req.file) {
          settingData.logoPath = req.file.filename;
        }
        const setting = id
          ? await Setting.findByIdAndUpdate(id, settingData)
          : await Setting(settingData).save();
        if (setting) {
          var msg = encodeMsg(
            `Setting successfully ${id ? `updated.` : "saved."}`
          );
          return res.redirect("/dashboard/setting?msg=" + msg);
        }
      }
      if (req.user.role == "student") {
        const err = {};
        const user = req.user;
        const editUser = req.body;
        const student = await User.findById(user._id);
        if (age.getAge() <= new Date(editUser.dob)) {
          console.log("here");
          err.dob = "Age should be 16+";
          console.log(err);
          return res.render("dashboard/examples/setting", {
            editUser,
            err,
          });
        } else {
          // if user want to edit with password then this if statement will be running
          if (editUser.currentPassword) {
            // checking here both password new and new confirm
            if (editUser.newPass == "" || editUser.newPass < 6) {
              err.newPass = "Password should be greater than or equal to 6.";
              return res.render("dashboard/examples/setting", {
                editUser,
                err,
              });
            }
            // check if both pass are equal
            else if (editUser.newPass != editUser.newPassConfirm) {
              err.newPassConfirm = "Please try both password should be equal.";
              return res.render("dashboard/examples/setting", {
                editUser,
                err,
              });
            } else {
              // now if everything is working then should be this if running
              const isMatch = await bcrypt.compare(
                editUser.currentPassword,
                student.password
              );
              if (isMatch) {
                const hashPass = await bcrypt.hash(editUser.newPass, 10);
                // if student uploaded his picture then do this
                if (req.file) {
                  let buffer = await sharp(req.file.buffer)
                    .resize({ width: 256, height: 256 })
                    .jpeg({ mozjpeg: true })
                    .toBuffer();
                  await student.updateOne(
                    {
                      name: editUser.name,
                      driver_license: editUser.driver_license,
                      dob: editUser.dob,
                      password: hashPass,
                      avatar: buffer,
                    },
                    { runValidators: true },
                    (error, result) => {
                      console.log("confirmed");
                      if (error) {
                        err.driver_license =
                          "This driver license Already in Use please try another!";
                        console.log(err);
                        return res.render("dashboard/examples/setting", {
                          editUser,
                          err,
                        });
                      }
                      if (result) {
                        console.log("reasult");
                        var msg = encodeMsg(`Setting saved successfully`);
                        return res.redirect("/dashboard/setting?msg=" + msg);
                      }
                    }
                  );
                } else {
                  // withoout avatar upload student
                  if (editUser.hiddenImg == "") {
                    student.avatar = undefined;
                    await student.save();
                  }
                  await student.updateOne(
                    {
                      name: editUser.name,
                      driver_license: editUser.driver_license,
                      dob: editUser.dob,
                      password: hashPass,
                    },
                    { runValidators: true },
                    (error, result) => {
                      console.log("confirmed");
                      if (error) {
                        err.driver_license =
                          "This driver license Already in Use please try another!";
                        console.log(err);
                        return res.render("dashboard/examples/setting", {
                          editUser,
                          err,
                        });
                      }
                      if (result) {
                        console.log("reasult");
                        var msg = encodeMsg(`Setting saved successfully`);
                        return res.redirect("/dashboard/setting?msg=" + msg);
                      }
                    }
                  );
                }
              } else {
                console.log("wrong password");
                err.currentPassword =
                  "Your current password is wrong. Please try Correct Password.";
                return res.render("dashboard/examples/setting", {
                  editUser,
                  err,
                });
              }
            }
          } else {
            // updating without password

            // update Student with image
            if (req.file) {
              let buffer = await sharp(req.file.buffer)
                .resize({ width: 250, height: 250 })
                .jpeg({ mozjpeg: true })
                .toBuffer();
              await student.updateOne(
                {
                  name: editUser.name,
                  driver_license: editUser.driver_license,
                  dob: editUser.dob,
                  avatar: buffer,
                },
                { runValidators: true },
                (error, result) => {
                  const err = {};
                  if (error) {
                    err.driver_license =
                      "This driver license Already in Use please try another!";
                    console.log(err);
                    return res.render("dashboard/examples/setting", {
                      editUser,
                      err,
                    });
                  }
                  if (result) {
                    var msg = encodeMsg(`Setting saved successfully`);
                    res.redirect("/dashboard/setting?msg=" + msg);
                  }
                }
              );
            } else {
              // update student without image

              // if user remove his image then avatar should be undefined that removed image
              if (editUser.hiddenImg == "") {
                student.avatar = undefined;
                await student.save();
              }
              await student.updateOne(
                {
                  name: editUser.name,
                  driver_license: editUser.driver_license,
                  dob: editUser.dob,
                },
                { runValidators: true },
                (error, result) => {
                  const err = {};
                  if (error) {
                    err.driver_license =
                      "This driver license Already in Use please try another!";
                    console.log(err);
                    return res.render("dashboard/examples/setting", {
                      editUser,
                      err,
                    });
                  }
                  if (result) {
                    var msg = encodeMsg(`Setting saved successfully`);
                    res.redirect("/dashboard/setting?msg=" + msg);
                  }
                }
              );
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      if (error.type == "StripeAuthenticationError") {
        req.flash("error", { stripe: "Invalid API Key" });
        return res.redirect("/dashboard/setting");
      }
      var msg = encodeMsg(error.message, "danger", 500);
      res.redirect("/dashboard/setting?msg=" + msg);
    }
  },
  settingError(error, req, res, next) {
    // console.log(error.message);
    var msg = encodeMsg(error.message, "danger", 500);
    res.redirect("/dashboard/setting?msg=" + msg);
  },
};
