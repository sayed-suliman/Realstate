const { decodeMsg, encodeMsg } = require("../helper/createMsg");
const Course = require("../models/courses");

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
    res.render("dashboard/student/buy-more", {
      title: "Dashboard | Buy More",
      allCourses,
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  } catch (e) {
    let msg = encodeMsg(e.message, "danger");
    res.redirect("/dashboard?msg=" + msg);
  }
};
