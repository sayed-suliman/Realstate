const { encodeMsg, decodeMsg } = require("../../helper/createMsg");
const Category = require("../../models/salesperson/category");

module.exports = {
  all: (req, res) => {
    try {
      var msgToken = req.query.msg;
      var msg = {};
      if (msgToken) {
        msg = decodeMsg(msgToken);
      }
      res.render("dashboard/examples/salesperson/category/detail", {
        title: "Category",
        toast: Object.keys(msg).length == 0 ? undefined : msg,
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-category?msg=" + encodeMsg(error.message)
      );
    }
  },
  add: (req, res) => {
    var msgToken = req.query.msg;
    var msg = {};
    if (msgToken) {
      msg = decodeMsg(msgToken);
    }
    res.render("dashboard/examples/salesperson/category/add", {
      title: "Add Category",
      toast: Object.keys(msg).length == 0 ? undefined : msg,
    });
  },
  edit: (req, res) => {
    try {
      res.render("dashboard/examples/salesperson/category/add", {
        toast: Object.keys(msg).length == 0 ? undefined : msg,
        edit: {
          name: "test",
        },
      });
    } catch (error) {}
  },
  post: async (req, res) => {
    try {
      const { name } = req.body;
      const category = await Category({ name }).save();
      if (category) {
        res.redirect(
          "/dashboard/salesperson/add-category?msg=" +
            encodeMsg("Category added successfully.")
        );
      }
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/add-category?msg=" + encodeMsg(error.message)
      );
    }
  },
};
