const User = require("../models/users");
const crypto = require("crypto");
const ResetToken = require("../models/reset-token");
const bcrypt = require("bcrypt");
const { sendResetEmail } = require("./mailServices");
module.exports = {
  forgotPassword(req, res) {
    res.render("forgot-password", {
      title: "Forgot Password",
      reset: false,
    });
  },
  async doForgotPassword(req, res) {
    try {
      const { email } = req.body;
      var user = await User.findOne({ email });
      if (!user) {
        return res.render("forgot-password", {
          title: "Forgot Password",
          reset: false,
          msg: "No user found!",
          type: "danger",
        });
      }
      var token = crypto.randomBytes(32).toString("hex");
      // if the email had already token exist in db then update it, else save it
      (await ResetToken.findOne({ email }))
        ? await ResetToken.findOneAndUpdate({ email }, { $set: { token } })
        : await ResetToken({ token: token, email }).save();
      sendResetEmail(email, token);
      return res.render("forgot-password", {
        title: "Forgot Password",
        reset: false,
        msg: "Reset link send to your email account.",
        type: "success",
      });
    } catch (error) {
      res.redirect("/500");
    }
  },
  async resetPassword(req, res) {
    const token = req.query.token;
    if (token) {
      const checkToken = await ResetToken.findOne({ token });
      if (checkToken) {
        return res.render("forgot-password", {
          title: "Reset Password",
          reset: true,
          email: checkToken.email,
        });
      }
      return res.render("forgot-password", {
        title: "Reset Password",
        reset: false,
        msg: "Token tampered or expired",
        type: "danger",
      });
    }
    return res.redirect("/");
  },
  async doResetPassword(req, res) {
    try {
      const { password, cPassword, email } = req.body;
      const token = await ResetToken.findOne({ email });
      if (!token) {
        req.flash("error", {
          msg: "Token tampered or expired",
          type: "danger",
        });
        return res.redirect("/reset-password?token=");
      }
      if (!password || !cPassword) {
        return res.render("forgot-password", {
          title: "Reset Password",
          email,
          reset: true,
          msg: "All fields are required.",
          type: "danger",
        });
      }
      if (password != cPassword) {
        return res.render("forgot-password", {
          title: "Reset Password",
          email,
          reset: true,
          msg: "Password doesn't match.",
          type: "danger",
        });
      }
      if (password.length < 8) {
        return res.render("forgot-password", {
          title: "Reset Password",
          email,
          reset: true,
          msg: "Password length must be 8 characters long.",
          type: "danger",
        });
      }
      const hash = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate({ email }, { $set: { password: hash } });
      console.log(await User.findOne({ email }));
      await ResetToken.findOneAndDelete({ email });
      return res.redirect("/");
    } catch (error) {
      console.log(error);
      res.redirect("/500");
    }
  },
};
