const { encodeMsg } = require("../../helper/createMsg");

module.exports = {
  async tests(req, res) {
    try {
      res.render("dashboard/examples/salesperson/tests/test", {
        title: "Test",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
  async testsResult(req, res) {
    try {
      res.render("dashboard/examples/salesperson/tests/test", {
        result: true,
        title: "Test",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
};
