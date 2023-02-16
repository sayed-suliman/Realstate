const User = require("../models/users");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      User.findOne({ email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Credentials doesn't match." });
        }
        bcrypt.compare(password, user.password, async (error, match) => {
          if (error) {
            return done(error, false);
          }
          if (!match) {
            return done(null, false, { message: "Credentials doesn't match." });
          }
          if (user.role == "student") {
            if (user.package) {
              await user.populate({
                path: "package",
                populate: { path: "courses", match: { status: "publish" } },
              });
              if (!user.package || !user.package.courses) {
                //show this message when there is no package or course in the database
                return done(null, false, {
                  message: "Your package is expired or is no longer available.",
                });
              }
            }
            if (user.courses.length) {
              await user.populate("courses");
              if (!user.courses || !user.courses.length > 0) {
                //show this message when there is no course in the database
                return done(null, false, {
                  message: "Your course is no longer available.",
                });
              }
            }
          }
          return done(null, user);
        });
      });
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
