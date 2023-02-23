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
            console.log(user.packages, user.courses);
            console.log((
              !user.packages ||
              !user.packages.length ||
              !user.courses ||
              !user.courses.length
            ));
            if (
              !user.packages ||
              !user.packages.length ||
              !user.courses ||
              !user.courses.length
            ) {
              //show this message when there is no package or course in the database
              return done(null, false, {
                message:
                  "Your packages/courses are expired or is no longer available.",
              });
            }
          }
          if (user.role == "guest") {
            if (!user.trialCourse) {
              //show this message when there is no package or course in the database
              return done(null, false, {
                message: "Your course is expired or is no longer available.",
              });
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
