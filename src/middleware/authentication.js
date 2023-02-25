const Order = require("../models/order");
const url = require("url");
const { encodeMsg } = require("../helper/createMsg");
const OTP = require("../models/otp");
const { generateCode } = require("../helper/genCode");
const { sendVerificationCode } = require("../controllers/mailServices");
const User = require("../models/users");
const Message = require("../models/message");

// for authenticated user only
var authenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    //this used for to avoid going back when user logged out
    res.set(
      "Cache-Control",
      "no-cache,private,no-store,must-revalidate,post-check=0,pre-check=0"
    );
    // pass auth user to all view when used this middleware
    if (req.user.avatar) {
      req.user.avatar = req.user.avatar.toString("base64");
    }
    res.locals.user = req.user;
    if (req.session.admin) {
      res.locals.user.loginAsStudent = true;
    }
    // check whether user bought a package or not
    if (req.user.role == "student") {
      // when user is not verified
      if (!req.user.verified) {
        const otpCode = generateCode();
        await OTP({
          email: req.user.email,
          otp: otpCode,
        }).save();
        sendVerificationCode(req.user.email, otpCode);
        return res.redirect(
          url.format({
            pathname: "/verification",
            query: {
              user: req.user._id.toString(),
            },
          })
        );
      }
      // check that the user have purchase any package or course
      var order = await Order.findOne({ user: req.user._id });
      if (!order) {
        // when logged in by admin as student
        if (req.session.admin) {
          req.session.adminMsg = "This User hasn't made a payment";
          return res.redirect("/logout");
        }
        req.flash("error", "Please make a payment to continue.");
        return res.redirect(
          url.format({
            pathname: "/payment",
            query: {
              user: req.user._id.toString(),
            },
          })
        );
      }
    }
    res.locals.unreadMsg = await Message.find({ read: false }).count();
    return next();
  } else {
    req.flash("error", "Please! Login to continue.");
    res.redirect("/login");
  }
};
// redirect to dashboard when user is logged in
var logged_in = (req, res, next) => {
  if (req.isAuthenticated()) {
    // req.flash("error", encodeMsg("test", "danger"));
    // req.flash("success", encodeMsg("test"));
    res.redirect("/dashboard");
  } else {
    next();
  }
};
var isStudent = (req, res, next) => {
  if (req.user.role === "student") {
    next();
  } else {
    res.redirect("/dashboard");
  }
};
var isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.redirect("/dashboard");
  }
};
var isRegulatorOrStudent = (req, res, next) => {
  if (req.user.role === "regulator" || req.user.role === "student") {
    next();
  } else {
    res.redirect("/dashboard");
  }
};
var verifiedAndPaid = async (req, res, next) => {
  // check whether user bought a package or not

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    if (user.role == "student") {
      if (!user.verified) {
        const otpCode = generateCode();
        await OTP({
          email: user.email,
          otp: otpCode,
        }).save();
        sendVerificationCode(user.email, otpCode);
        return res.redirect(
          url.format({
            pathname: "/verification",
            query: {
              user: user._id.toString(),
            },
          })
        );
      }
      var order = await Order.findOne({ user: user._id });
      if (!order) {
        req.flash("error", "Please make a payment to continue.");
        if (user.packages.length) {
          req.session.cart = {
            user: user._id,
            item: user.packages[0],
            itemType: "package",
          };
        }
        if (user.courses.length) {
          req.session.cart = {
            user: user._id,
            item: user.courses[0],
            itemType: "course",
          };
        }
        return res.redirect(
          url.format({
            pathname: "/payment",
            query: {
              user: user._id.toString(),
            },
          })
        );
      }
    }
  }
  next();
};

module.exports = {
  authenticated,
  logged_in,
  verifiedAndPaid,
  isStudent,
  isAdmin,
  isRegulatorOrStudent,
};
