const Package = require("../models/package");
const { generateCode } = require("../helper/genCode");
const { sendVerificationCode } = require("./mailServices");
const url = require("url");
const User = require("../models/users");
const Course = require("../models/courses");

module.exports = {
  async checkout(req, res) {
    // for login only
    req.session.returnURL = req.url;
    try {
      const packageID = req.query.package;
      const courseID = req.query.course;

      // when user buying package
      if (packageID) {
        var package = await Package.findById(packageID)
          .where("status")
          .equals("publish");
        if (package) {
          if (req.user) {
            // await User.findByIdAndUpdate(req.user._id, { package: packageID })
            return res.redirect(
              url.format({
                pathname: "/payment",
                query: {
                  user: req.user._id.toString(),
                },
              })
            );
          }
          var { price, tax } = package;
          package.total = (price * ((100 + tax) / 100)).toFixed(2); //total price with tax
          return res.render("checkout", {
            title: "Checkout",
            package,
            reCaptchaSiteKey: process.env.recaptcha_siteKey,
          });
        }
      }

      // when user buying single course
      if (courseID) {
        let course = await Course.findById(courseID)
          .where("status")
          .equals("publish");
          if (course) {
            if (req.user) {
              return res.redirect(
                url.format({
                  pathname: "/payment",
                  query: {
                    user: req.user._id.toString(),
                  },
                })
              );
            }
            course.total = (course.price).toFixed(2); //total price with tax
            return res.render("checkout", {
              title: "Checkout",
              course,
              reCaptchaSiteKey: process.env.recaptcha_siteKey,
            });
          }
          
      }

      return res.redirect("/");
    } catch (error) {
      res.redirect("/");
    }
  },
  doCheckout(req, res) {
    sendVerificationCode("sulimank418@gmail.com", generateCode());
    res.send(generateCode());
  },
};
