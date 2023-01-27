const { validationResult } = require("express-validator");
const User = require("./../models/users");
const Package = require("./../models/package");
const url = require("url");
const OTP = require("../models/otp");
const { generateCode } = require("../helper/genCode");
const { sendVerificationCode } = require("./mailServices");
const bcrypt = require("bcrypt");

const login = (req, res) => {
  res.render("login", {
    title: "Login",
  });
};
const postLogin = (req, res) => {
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
    const data = await req.body;
    // selected package detail
    var package = await Package.findById(data.package);
    var { price, tax } = package;
    package.total = price * ((100 + tax) / 100); //total price with tax
    const formValidations = validationResult(req);
    if (formValidations.errors.length) {
      res.locals.oldData = req.body;
      const errorObj = {};
      formValidations.errors.forEach((element) => {
        errorObj[element.param] = element.msg;
      });
      if (errorObj.email.includes("redirect to verification")) {
        const userId = errorObj.email.split(",")[1];
        const password = await bcrypt.hash(data.password, 10);
        await User.findByIdAndUpdate(userId, {
          name: data.name,
          package: data.package,
          password,
        });
        res.redirect("/verification?user=" + userId);
      } else {
        res.render("checkout", {
          title: "Checkout",
          err: errorObj,
          package,
        });
      }
    } else {
      const otpCode = generateCode();
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
    res.status(404).send({
      error: e.message,
    });
  }
};

module.exports = { login, postLogin, signUp };
