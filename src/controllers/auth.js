const { validationResult } = require("express-validator");
const User = require("./../models/users");
const Package = require("./../models/package");
const url = require("url");
const OTP = require("../models/otp");
const { generateCode } = require("../helper/genCode");
const { sendVerificationCode } = require("./mailServices");
const Course = require("../models/courses");

const login = (req, res) => {
  res.render("login", {
    title: "Login",
    reCaptchaSiteKey: process.env.recaptcha_siteKey,
  });
};
const postLogin = (req, res) => {
  // by default redirect to dashboard
  let redirectTo = "/dashboard";
  if (req.body.remember) {
    req.session.cookie.maxAge = 14 * 24 * 60 * 60 * 1000; // Cookie expires after 14 days
  } else {
    req.session.cookie.expires = false; // Cookie expires at end of session
  }

  if (req.session.returnURL) {
    redirectTo = req.session.returnURL;
    delete req.session.returnURL;
  }
  res.redirect(redirectTo);
};

const signUp = async (req, res) => {
  try {
    let data = await req.body;
    let cart = {
      user: null,
      item: data.package || data.course,
      itemType: data.package ? "package" : "course",
    };
    req.session.cart = cart;
    const formValidations = validationResult(req);
    if (formValidations.errors.length) {
      res.locals.oldData = req.body;
      const errorObj = {};
      formValidations.errors.forEach((element) => {
        errorObj[element.param] = element.msg;
      });

      /*
      when user have left registration at verification page
      or when user already exist but not verified
      */
      if (errorObj.email?.includes("redirect to verification")) {
        const userId = errorObj.email.split(",")[1];
        res.redirect("/verification?user=" + userId);
      } else {
        // this section render when error exist
        let renderObject = {
          title: "Checkout",
          err: errorObj,
        };
        if (data.package) {
          let package = await Package.findById(data.package);
          let { price, tax } = package;
          package.total = price * ((100 + tax) / 100); //total price with tax
          renderObject = { ...renderObject, package };
        }
        if (data.course) {
          let course = await Course.findById(data.course);
          renderObject = { ...renderObject, course };
        }
        res.render("checkout", renderObject);
      }
    } else {
      // req.session.cart = cart;
      const otpCode = generateCode();

      // to save user with package or course
      delete data.course;
      delete data.package;

      const user = await User(data).save();
      await OTP({
        email: data.email,
        otp: otpCode,
      }).save();
      sendVerificationCode(data.email, otpCode);
      if (user) {
        return res.redirect(
          url.format({
            pathname: "/verification",
            query: {
              user: user._id.toString(),
            },
          })
        );
      }
    }
  } catch (e) {
    if (req.body.course) {
      req.flash("error", e.message);
      return res.redirect("/checkout?course=" + req.body.course);
    }
    if (req.body.package) {
      req.flash("error", e.message);
      return res.redirect("/checkout?package=" + req.body.package);
    }
  }
};

module.exports = { login, postLogin, signUp };
