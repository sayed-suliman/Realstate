const { encodeMsg } = require("../../helper/createMsg");
const Quiz = require("../../models/salesperson/quiz");
const Result = require("../../models/salesperson/results");

module.exports = {
  async tests(req, res) {
    try {
      const tests = await Quiz.find();
      let takenTest = await Result.find({ user: req.user }).select("test");
      takenTest = takenTest.map((result) => {
        return result.test[0].toString();
      });
      tests.map((test) => {
        if (takenTest.includes(test._id.toString())) {
          test.taken = true;
        }
      });
      console.log(takenTest);
      res.render("dashboard/examples/salesperson/tests/test", {
        title: "Test",
        tests,
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
