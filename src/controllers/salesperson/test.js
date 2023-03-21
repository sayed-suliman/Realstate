const { encodeMsg } = require("../../helper/createMsg");
const Quiz = require("../../models/salesperson/quiz");
const Result = require("../../models/salesperson/results");

module.exports = {
  async tests(req, res) {
    try {
      const tests = await Quiz.find({ questions: { $gt: [] } }).sort({
        title: 1,
      });
      let takenTest = await Result.find({ user: req.user }).select("test");
      takenTest = takenTest.map((result) => {
        return result.test[0]._id.toString();
      });
      tests.map((test) => {
        if (takenTest.includes(test._id.toString())) {
          test.taken = true;
        }
      });
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
      const results = await Result.find({
        test: { $elemMatch: { model: "Sp_quiz" } },
        user: req.user._id,
      }).populate("test._id");
      res.render("dashboard/examples/salesperson/tests/test", {
        results: results,
        title: "Test",
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson?msg=" + encodeMsg(error.message, "danger")
      );
    }
  },
};
