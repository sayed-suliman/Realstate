const OTP = require("../models/otp");
const User = require("../models/users");
const url = require("url");
const { encodeMsg } = require("../helper/createMsg");

module.exports = {
  async verification(req, res) {
    try {
      var { user: userID } = req.query;
      if (userID) {
        let user = await User.findById(userID);
        if (!user) {
          const msg = encodeURIComponent("Please! User not found.");
          return res.redirect(`/?msg=${msg}&type=danger`);
        }
        // if verified user then redirect to payment
        if (user.verified) {
          return res.redirect(
            url.format({
              pathname: "/payment",
              query: {
                user: user._id.toString(),
              },
            })
          );
        } else {
          return res.render("verification", {
            title: "Verification",
            user,
          });
        }
      }
      return res.redirect("/");
    } catch (error) {
      console.log("Error at verification:", error);
      return res.redirect("/");
    }
  },
  async doVerification(req, res) {
    const { val1, val2, val3, val4, userID } = req.body;
    const code = val1 + val2 + val3 + val4;
    const otp = await OTP.findOne({ otp: code });
    if (!otp) {
      let user = await User.findById(userID);
      return res.render("verification", {
        title: "Verification",
        user,
        err: "OTP incorrect or expired.",
      });
    }
    const user = await User.findByIdAndUpdate(userID, { verified: true });
    await otp.deleteOne();
    if (user.role == "guest") {
      req.login(user, function (error) {
        if (error) {
          return res.redirect("/?msg=" + encodeURIComponent(error) + "&type=danger");
        }
        return res.redirect("/dashboard?msg="+encodeMsg(`Welcome to ${process.env.SITE_NAME}.`));
      });
    }
    res.redirect(
      url.format({
        pathname: "/payment",
        query: {
          user: user._id.toString(),
        },
      })
    );
  },
};
