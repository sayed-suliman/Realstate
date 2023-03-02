const Package = require("../models/package");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Order = require("../models/order");
const Course = require("../models/courses");

module.exports = {
  async users(req, res) {
    try {
      var msgToken = req.query.msg;
      var option = {};
      if (msgToken) {
        var msg = decodeMsg(msgToken);
        option = msg;
      }
      const users = await User.find().populate(["packages","courses"]);
      // binary to base64
      users.forEach((user, index) => {
        if (users[index].avatar) {
          users[index].avatar = users[index].avatar.toString("base64");
        }
      });
      res.render("dashboard/examples/users/users", {
        title: "Dashboard | Users",
        users,
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      var msg = encodeMsg(e.message);
      res.redirect("/dashboard/users?msg=" + msg);
    }
  },
  async addUsers(req, res) {
    try {
      const packages = await Package.find({ status: "publish" });
      const courses = await Course.find({ status: "publish" });
      var msgToken = req.query.msg;
      var option = {};
      if (msgToken) {
        var msg = decodeMsg(msgToken);
        option = msg;
      }
      res.render("dashboard/examples/users/add-users", {
        title: "Dashboard | Add-User",
        packages,
        courses,
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      var msg = encodeMsg(e.message);
      res.redirect("/dashboard/users?msg=" + msg);
    }
  },
  // post user
  async postUser(req, res) {
    try {
      const data = req.body;
      const formValidations = validationResult(req);
      const packages = await Package.find({ status: "publish" });
      if (formValidations.errors.length) {
        const errorObj = {};
        formValidations.errors.forEach((element) => {
          errorObj[element.param] = element.msg;
        });
        return res.render("dashboard/examples/users/add-users", {
          title: "Dashboard | Add-User",
          err: errorObj,
          data,
          packages,
        });
      }
      let userObj = {
        name: data.name,
        email: data.email,
        role: data.role,
        dob: data.dob,
        password: data.password,
        verified: true,
      };
      if (data.role == "student" && data.package) {
        userObj.packages = [data.package];
      }
      if (data.role == "student" && data.course) {
        userObj.courses = [data.course];
      }
      const user = await User(userObj).save();
      if (user) {
        if (data.role == "student") {
          let orderObj = {
            user: user._id,
            verified: true,
            pay_method: "Offline Payment",
            amount: data.amount,
          };
          if (data.package) {
            orderObj.package = data.package || undefined;
          }
          if (data.course) {
            orderObj.course = data.course || undefined;
          }
          await Order(orderObj).save();
        }
        var msg = encodeMsg("User Added Successfully.");
        res.redirect("/dashboard/users?msg=" + msg);
      }
    } catch (e) {
      var msg = encodeMsg(e.message);
      res.redirect("/dashboard/users?msg=" + msg);
    }
  },
  // edit user
  async editUser(req, res) {
    try {
      var msgToken = req.query.msg;
      var option = {};
      if (msgToken) {
        var msg = decodeMsg(msgToken);
        option = msg;
      }
      const uId = req.params.id;
      const editUser = await User.findById(uId);
      const order = await Order.findOne({ user: uId }).select("amount");
      const packages = await Package.find({ status: "publish" });
      const courses = await Course.find({ status: "publish" });
      res.render("dashboard/examples/users/user-edit", {
        title: "Dashboard | User-Edit",
        editUser,
        packages,
        courses,
        order,
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      var msg = encodeMsg(e.message);
      res.redirect("/dashboard/users?msg=" + msg);
    }
  },
  // update user
  async updateUser(req, res) {
    try {
      const uId = req.query.uId;
      const editUser = req.body;
      editUser.salesperson = !!editUser.salesperson;
      const order = await Order.findOne({ user: uId }).select("amount");
      const packages = await Package.find({ status: "publish" });
      const courses = await Course.find({ status: "publish" });
      const user = await User.findById(uId);
      editUser.courses = editUser.courses || [];
      editUser.packages = editUser.packages || [];
      await user.updateOne(
        { ...editUser },
        { runValidators: true },
        async (error, result) => {
          if (error) {
            const err = {};
            if (error.message.includes("driver_license")) {
              err.driver_license =
                "This driver license Already in Use please try another!";
            }
            if (error.message.includes("email")) {
              err.email = "This Email Id is Already in Use please try another!";
            }
            editUser._id = uId;
            return res.render("dashboard/examples/users/user-edit", {
              title: "Dashboard | Add-User",
              err,
              editUser,
              packages,
              courses,
              order: {
                amount: editUser.amount,
              },
            });
          }
          if (result) {
            var msg = encodeMsg("User Updated Successfully.");
            if (order) {
              await order.updateOne(
                { amount: editUser.amount },
                { runValidators: true }
              );
            } else {
              let orderObj = {
                user: uId,
                amount: editUser.amount,
                verified: true,
                pay_method: "Offline Payment",
              };
              if (editUser.packages) {
                orderObj.package = Array.isArray(editUser.packages)
                  ? editUser.packages[0]
                  : editUser.packages;
              } else if (editUser.courses) {
                orderObj.course = Array.isArray(editUser.courses)
                  ? editUser.courses[0]
                  : editUser.courses;
              }
              await Order(orderObj).save();
            }
            res.redirect(`/dashboard/users?msg=` + msg);
          }
        }
      );
    } catch (e) {
      res.redirect("/dashboard/user?msg=" + encodeMsg(e.message));
    }
  },
};
