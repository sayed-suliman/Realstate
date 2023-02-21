const generateVoucher = require("voucher-code-generator");
const Coupon = require("../models/coupons");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Order = require("../models/order");
const User = require("../models/users");
const url = require("url");
const { welcomeEmail } = require("./mailServices");

module.exports = {
  async getCoupon(req, res) {
    try {
      var msgToken = req.query.msg;
      var option = {};
      if (msgToken) {
        var msg = decodeMsg(msgToken);
        option = msg;
      }
      res.render("dashboard/examples/coupons/add-coupon", {
        title: "Dashboard | Add Coupon",
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      res.status(404).json({
        err: e.message,
        status: 404,
      });
    }
  },
  async postCoupon(req, res) {
    try {
      var data = await req.body;
      data.length = data.length || -1;
      let codes = await generateVoucher.generate({
        length: 10,
        pattern: data.pattern,
      });

      const couponAdded = await Coupon({
        code: codes[0],
        discount: data.discount,
        length: data.length,
        validFrom: data.validFrom,
        validTill: data.validTill,
      });
      await couponAdded.save();

      var msg = encodeMsg("Coupon code has been generated");
      return res.redirect("/dashboard/coupon-detail?msg=" + msg);
    } catch (e) {
      var msg = await encodeMsg("Sorry!" + e.message, "danger");
      return res.redirect("/dashboard/add-coupon?msg=" + msg);
    }
  },
  async detailsCoupon(req, res) {
    try {
      var msgToken = req.query.msg;
      const coupons = await Coupon.find().sort({ createdAt: 1 });
      var option = {};
      if (msgToken) {
        var msg = decodeMsg(msgToken);
        option = msg;
      }
      res.render("dashboard/examples/coupons/coupons-detail", {
        title: "Dashboard | Coupons Detail",
        coupons,
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      res.json({
        msg: e.message,
        status: 403,
      });
    }
  },
  async deleteCoupon(req, res) {
    try {
      let couponId = req.query.vId;
      const coupon = await Coupon.findById(couponId);
      await coupon.remove();
      var msg = encodeMsg("Coupon Delete Successfully", "danger");
      return res.redirect("/dashboard/coupon-detail?msg=" + msg);
    } catch (e) {
      res.render("500");
    }
  },
  async couponAPI(req, res) {
    const { code } = req.body;
    var coupon = await Coupon.findOne({
      code,
      validTill: { $gte: new Date() },
      length: { $ne: 0 },
    });
    if (coupon) {
      coupon = coupon.toObject();
      delete coupon.length;
      delete coupon.validFrom;
      delete coupon.validTill;
      delete coupon.createdAt;
      delete coupon.updatedAt;
      return res.send({
        success: {
          msg: `${coupon.discount}% discount is applied on your payment.`,
          coupon,
        },
      });
    }
    res.send({ error: "Coupon Code doesn't exist." });
  },
  async couponRegisterAPI(req, res) {
    try {
      if (req.body.couponId && req.body.user) {
        const { couponId, dob, id } = req.body;
        const cart = req.session.cart;
        var coupon = await Coupon.findOne({
          couponId,
          validTill: { $gte: new Date() },
          length: { $ne: 0 },
          discount: 100,
        });
        const user = await User.findById(req.body.user);
        // adding item(course) to user model
        if (cart.itemType == "course") {
          if (
            Array.isArray(user.courses) &&
            !user.courses.includes(cart.item)
          ) {
            user.courses.push(cart.item);
          } else {
            user.courses = [cart.item];
          }
        }
        // adding item(package) to user model
        if (cart.itemType == "package") {
          if (
            Array.isArray(user.courses) &&
            !user.packages.includes(cart.item)
          ) {
            user.packages.push(cart.item);
          } else {
            user.packages = [cart.item];
          }
        }
        if (coupon) {
          user.updateOne(
            {
              packages: user.packages,
              courses: user.courses,
              dob,
              driver_license: id,
            },
            { runValidators: true },
            async (error, result) => {
              if (error) {
                if (error.message.indexOf("duplicate key error") != -1) {
                  return res.send({
                    error: "Driver License is already taken.",
                    id: true,
                  });
                }
              }
              if (result) {
                const order = await Order({
                  user: user._id,
                  [cart.itemType]: cart.item,
                  amount: 0,
                  pay_method: "Coupon Discount",
                  discount: coupon.discount,
                  verified: true,
                }).save();
                await Coupon.findOneAndUpdate(
                  { _id: coupon._id, length: { $gt: 0 } },
                  { $inc: { length: -1 } }
                );
                welcomeEmail(user.email, {
                  username: user.name,
                  orderDate: order.createdAt,
                  packageName: user.packages.name,
                  totalPrice: 0,
                  siteName: process.env.SITE_NAME,
                  siteURL: "https://members.realestateinstruct.com",
                });
                return req.login(user, function (err) {
                  if (err) {
                    return next(err);
                  }
                  return res.send({
                    url: url.format({
                      pathname: "/dashboard",
                      query: {
                        msg: encodeMsg(`Welcome to ${process.env.SITE_NAME}`),
                      },
                    }),
                  });
                });
              }
            }
          );
        } else {
          return res.send({ error: "Coupon Code doesn't exist." });
        }
      } else {
        return res.send({ error: "Coupon code is required." });
      }
    } catch (error) {
      res.send({ error: error.message });
    }
  },
};
