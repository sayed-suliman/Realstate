const Order = require("../models/order");
const User = require("../models/users");
const url = require("url");
const { encodeMsg } = require("../helper/createMsg");
const Course = require("../models/courses");
const Package = require("../models/package");

module.exports = {
  async payment(req, res) {
    var msg = { text: res.locals.error, type: "danger" };
    const userID = req.query.user;
    const cart = req.session.cart;
    let itemDetail = {
      type: cart?.itemType,
    };
    try {
      if (userID) {
        const user = await User.findById(userID);
        if (user.verified) {
          // admin and regulator redirect to dashboard with msg
          // they can't buy a package
          if (user.role == "admin" || user.role == "regulator") {
            return res.redirect(
              url.format({
                pathname: "/dashboard",
                query: {
                  msg: encodeMsg(
                    `${user.role} can't buy a ${
                      cart.itemType ?? "course/package"
                    }.`,
                    "danger"
                  ),
                },
              })
            );
          }
          // if user has not select a package or course
          if (!cart?.item) {
            const msg = encodeURIComponent(
              "Please! Select a Package/Course to continue."
            );
            const type = encodeURIComponent("danger");
            return req.logout((error) => {
              if (error) {
                const msg = encodeURIComponent(error);
                const type = encodeURIComponent("danger");
                return res.redirect(`/?msg=${msg}&type=${type}`);
              }
              return res.redirect(`/?msg=${msg}&type=${type}`);
            });
          }

          // if user have already purchase a package which contain this course
          if (user.packages) {
            // mongoose id to string
            let userCourses = [].concat(
              ...user.packages.map((package) => {
                return package.courses.map((el) => el.toString());
              })
            );
            if (cart.itemType == "course" && userCourses.includes(cart.item)) {
              return req.login(user, function (err) {
                if (err) {
                  return next(err);
                }
                return res.redirect(
                  url.format({
                    pathname: "/dashboard",
                    query: {
                      msg: encodeMsg(
                        "You have already purchased a package which contain this course."
                      ),
                    },
                  })
                );
              });
            }
          }

          let orders = await Order.find({ user: user._id }).select(
            "package course user"
          );

          for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            /*
            if user have already purchase the course
            then redirect to dashboard
            */
            if (
              cart.itemType == "course" &&
              cart.item == order.course?.toString()
            ) {
              return req.login(user, function (err) {
                if (err) {
                  return next(err);
                }
                return res.redirect(
                  url.format({
                    pathname: "/dashboard",
                    query: {
                      msg: encodeMsg("Sorry. This course doesn't exist."),
                    },
                  })
                );
              });
            }
            // if user have already purchased package then redirect to dashboard
            if (
              cart.itemType == "package" &&
              cart.item == order.package?.toString()
            ) {
              return req.login(user, function (err) {
                if (err) {
                  return next(err);
                }
                return res.redirect(
                  url.format({
                    pathname: "/dashboard",
                    query: {
                      msg: encodeMsg(
                        "You have already purchased this package. You can also buy another one."
                      ),
                    },
                  })
                );
              });
            }
          }

          if (cart.itemType == "course" && cart.item) {
            let course = await Course.findOne({
              _id: cart.item,
              status: "publish",
            });
            itemDetail.name = course.name;
            itemDetail.price = course.price;
            itemDetail.total = course.price;
            itemDetail.tax = 0;
          }
          if (cart.itemType == "package" && cart.item) {
            let package = await Package.findById(cart.item)
              .where("status")
              .equals("publish");
            var { price, tax } = package;
            itemDetail.name = package.name;
            itemDetail.price = price;
            itemDetail.tax = tax;
            itemDetail.total = Math.round(price * ((100 + tax) / 100));
          }

          return res.render("payment", {
            title: "Payment",
            stripe_api: process.env.STRIPE_PUBLISHABLE_KEY,
            user,
            itemDetail,
            alert: res.locals.error.length > 0 ? msg : undefined,
            showDOB:
              user.driver_license == undefined || user.dob == undefined
                ? true
                : false,
          });
        } else {
          return res.redirect("/verification?user=" + req.user?._id.toString());
        }
      }
      return res.redirect("/");
    } catch (error) {
      console.log("Error at payment:", error);
      res.redirect("/");
    }
  },
};
