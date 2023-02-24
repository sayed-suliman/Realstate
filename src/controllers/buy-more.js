const { decodeMsg, encodeMsg } = require("../helper/createMsg");
const Course = require("../models/courses");
const Package = require("../models/package");

module.exports = async (req, res) => {
  try {
    const allCourses = await Course.find({ status: "publish" }).populate(
      "package"
    );
    var msgToken = req.query.msg;
    var option = {};
    if (msgToken) {
      var msg = decodeMsg(msgToken);
      option = msg;
    }
    let courses = await Course.find({ status: "publish" });
    let packages = await Package.find({ status: "publish" })
      .populate({
        path: "courses",
        match: {
          status: "publish",
        },
      })
      .sort("price");
    const packageObj = {};
    packages.forEach((package) => {
      packageObj[package.name] = package;
    });

    res.render("dashboard/student/buy-more", {
      title: "Dashboard | Buy More",
      allCourses,
      packages,
      courses,
      packageObj,
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  } catch (e) {
    let msg = encodeMsg(e.message, "danger");
    res.redirect("/dashboard?msg=" + msg);
  }
};
