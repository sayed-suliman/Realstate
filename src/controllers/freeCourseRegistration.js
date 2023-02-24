const { validationResult } = require("express-validator");
const { generateCode } = require("../helper/genCode");
const Course = require("../models/courses");
const OTP = require("../models/otp");
const User = require("../models/users");
const { sendVerificationCode } = require("./mailServices");

module.exports = {
  register: async (req, res) => {
    try {
      const courses = await Course.find().where("status").equals("publish");
      res.render("freeCourse-register", {
        title: "Free Lesson",
        reCaptchaSiteKey: process.env.recaptcha_siteKey,
        courses,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).redirect("/");
    }
  },
  doRegister: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const courses = await Course.find().where("status").equals("publish");
        const oldData = req.body;
        delete oldData.password;
        delete oldData.cPassword;
        console.log(oldData);
        res.locals.oldData = oldData;
        const errorObj = {};
        errors.errors.forEach((element) => {
          errorObj[element.param] = element.msg;
        });
        return res.status(400).render("freeCourse-register", {
          title: "Free Lesson",
          errorObj,
          reCaptchaSiteKey: process.env.recaptcha_siteKey,
          courses,
        });
      }
      let data = req.body;
      data.name = `${req.body.firstName} ${req.body.lastName}`;
      data.role = "guest";
      let user = await User(data).save();
      if (user) {
        const otpCode = generateCode();
        await OTP({
          email: user.email,
          otp: otpCode,
        }).save();
        sendVerificationCode(user.email, otpCode);
        console.log("---------");
        return res.redirect("/verification?user=" + user._id);
      }
    } catch (error) {
      console.log(error.message);
      req.flash("error", error.message);
      res.status(500).redirect("/free-lesson");
    }
  },
};
