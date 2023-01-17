const { encodeMsg, decodeMsg } = require("../../helper/createMsg");
const Category = require("../../models/salesperson/category");

module.exports = {
  all: async (req, res) => {
    try {
      var msgToken = req.query.msg;
      var msg = {};
      if (msgToken) {
        msg = decodeMsg(msgToken);
      }
      const categories = await Category.find();
      res.render("dashboard/examples/salesperson/category/detail", {
        title: "Category",
        toast: Object.keys(msg).length == 0 ? undefined : msg,
        categories,
      });
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-categories?msg=" + encodeMsg(error.message)
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
  edit: async (req, res) => {
    try {
      var msgToken = req.query.msg;
      var msg = {};
      if (msgToken) {
        msg = decodeMsg(msgToken);
      }

      let id = req.query.id;
      if (id) {
        let category = await Category.findById(id);
        if (category) {
          return res.render("dashboard/examples/salesperson/category/add", {
            toast: Object.keys(msg).length == 0 ? undefined : msg,
            category,
          });
        } else {
          return res.redirect(
            "/dashboard/salesperson/all-categories?msg=" +
              encodeMsg("No category found.", "danger")
          );
        }
      } else {
        return res.redirect(
          "/dashboard/salesperson/all-categories?msg=" +
            encodeMsg("Id must be required to edit category.", "danger")
        );
      }
    } catch (error) {
      return res.redirect(
        "/dashboard/salesperson/all-categories?msg=" + encodeMsg(error.message)
      );
    }
  },
  post: async (req, res) => {
    try {
      const { name, id } = req.body;
      let dataObj = { name };
      const category = id
        ? await Category.findByIdAndUpdate(id, dataObj)
        : await Category(dataObj).save();
      if (category) {
        res.redirect(
          "/dashboard/salesperson/all-categories?msg=" +
            encodeMsg(`Category ${id ? "Updated" : "added"} successfully.`)
        );
      }
    } catch (error) {
      res.redirect(
        "/dashboard/salesperson/all-categories?msg=" + encodeMsg(error.message)
      );
    }
  },
};
