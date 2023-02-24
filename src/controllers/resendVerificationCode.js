const { generateCode } = require("../helper/genCode");
const Course = require("../models/courses");
const OTP = require("../models/otp");
const Package = require("../models/package");
const User = require("../models/users");
const { sendVerificationCode } = require("./mailServices");

module.exports = {
  async resendCode(req, res) {
    var { email } = req.query;
    const cart = req.session.cart;
    let itemDetail = {
      type: cart?.itemType,
    };
    if (email && cart) {
      if (cart.itemType == "course" && cart.item) {
        let course = await Course.findById(cart.item);
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
      const otpCode = generateCode();
      sendVerificationCode(email, otpCode);
      const user = await User.findOne({ email });
      const code = await OTP.findOne({ email });
      // check whether otp exist or not
      code
        ? await code.updateOne({ otp: otpCode })
        : await OTP({ email, otp: otpCode }).save();

      return res.render("verification", {
        title: "Verification",
        user,
        itemDetail,
        // sent is used to show the msg at view
        sent: true,
      });
    }
    return res.redirect("/");
  },
};
