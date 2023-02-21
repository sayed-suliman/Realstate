const Package = require("../models/package");
const url = require("url");
const Course = require("../models/courses");
const { encodeMsg } = require("../helper/createMsg");

module.exports = {
  async checkout(req, res) {
    // for login only
    req.session.returnURL = req.url;
    try {
      const packageID = req.query.package;
      const courseID = req.query.course;
      let cart = {
        user: null,
        item: "",
        itemType: "",
      };
      // when user buying package
      if (packageID) {
        var package = await Package.findById(packageID)
          .where("status")
          .equals("publish");
        if (package) {
          cart.item = package._id;
          cart.itemType = "package";
          req.session.cart = cart;

          if (req.user) {
            // updating cart user
            req.session.cart.user = req.user._id;

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
            signUpError: req.flash('signUpError'),
          });
        }
      }

      // when user buying single course
      if (courseID) {
        let course = await Course.findById(courseID)
          .where("status")
          .equals("publish");

        if (course) {
          cart.item = course._id;
          cart.itemType = "course";
          req.session.cart = cart;
          if (req.user) {
            req.session.cart.user = req.user._id;
            return res.redirect(
              url.format({
                pathname: "/payment",
                query: {
                  user: req.user._id.toString(),
                },
              })
            );
          }
          course.total = course.price.toFixed(2); //total price with tax
          return res.render("checkout", {
            title: "Checkout",
            course,
            reCaptchaSiteKey: process.env.recaptcha_siteKey,
          });
        }
        if (req.user) {
          return res.redirect(
            "/dashboard?msg=" + encodeMsg("Sorry this course doesn't exist.")
          );
        }
        return res.redirect(
          `/?msg=Sorry this course doesn't exist.&type=danger`
        );
      }

      return res.redirect("/");
    } catch (error) {
      res.redirect("/");
    }
  },
};
