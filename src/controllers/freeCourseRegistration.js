const express = require("express");
const { validationResult } = require("express-validator");
const { encodeMsg } = require("../helper/createMsg");
const { generateCode } = require("../helper/genCode");
const OTP = require("../models/otp");
const User = require("../models/users");
const { sendVerificationCode } = require("./mailServices");

module.exports = {
  register: async (req, res) => {
    try {
      res.render("freeCourse-register", {
        title: "Free Lesson",
        reCaptchaSiteKey: process.env.recaptcha_siteKey,
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
        const oldData = req.body;
        delete oldData.password;
        delete oldData.cPassword;
        res.locals.oldData = oldData;
        const errorObj = {};
        errors.errors.forEach((element) => {
          errorObj[element.param] = element.msg;
        });
        return res.status(400).render("freeCourse-register", {
          title: "Free Lesson",
          errorObj,
          reCaptchaSiteKey: process.env.recaptcha_siteKey,
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
        return res.redirect("/verification?user=" + user._id);
      }
    } catch (error) {
      console.log(error.message);
      req.flash('error',error.message)
      res.status(500).redirect("/free-lesson");
    }
  },
};
