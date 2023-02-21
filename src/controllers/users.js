const Package = require("../models/package");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Order = require("../models/order");

module.exports = {
  async users(req, res) {
    var msgToken = req.query.msg;
    var option = {};
    if (msgToken) {
      var msg = decodeMsg(msgToken);
      option = msg;
    }
    const users = await User.find().populate("packages");
    // binary to base64
    for await (let [index] of users.entries()) {
      if (users[index].avatar) {
        users[index].avatar = users[index].avatar.toString("base64");
      }
    }
    res.render("dashboard/examples/users/users", {
      title: "Dashboard | Users",
      users,
      toast: Object.keys(option).length == 0 ? undefined : option,
    });
  },
  async addUsers(req, res) {
    try {
      const packages = await Package.find({ status: "publish" });
      var msgToken = req.query.msg;
      var option = {};
      if (msgToken) {
        var msg = decodeMsg(msgToken);
        option = msg;
      }
      res.render("dashboard/examples/users/add-users", {
        title: "Dashboard | Add-User",
        packages,
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      res.render("500", {
        title: "Error 500",
        err: e.message,
      });
    }
  },
  // post user
  async postUser(req, res) {
    try {
      const data = req.body;
      const formValidations = validationResult(req);
      const packages = await Package.find({ status: "publish" });
      const package =
        (await Package.findOne({ name: data.package }).select("_id")) || "";
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
      const user = await User({
        name: data.name,
        email: data.email,
        role: data.role,
        package: package || undefined,
        dob: data.dob,
        password: data.password,
        verified: true,
      }).save();
      if (user) {
        if (data.role == "student") {
          let order = await Order({
            user: user._id,
            package: package || undefined,
            verified: true,
            pay_method: "Offline Payment",
            amount: data.amount,
          }).save();
        }
        var msg = encodeMsg("User Added");
        res.redirect("/dashboard/add-user?msg=" + msg);
      }
      // const packages = await Package.find({ status: "publish" })
      // res.render("dashboard/examples/users/add-users", {
      //     title: "Dashboard | Add-User",
      //     packages
      // })
    } catch (e) {
      res.render("500", {
        title: "Error 500",
        err: e.message,
      });
      // res.status(404).json({
      //     err: e.message,
      //     status: 404
      // })
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
      const editUser = await User.findById(uId).populate("package");
      const order = await Order.findOne({ user: uId }).select("amount");
      const packages = await Package.find();
      res.render("dashboard/examples/users/user-edit", {
        title: "Dashboard | User-Edit",
        editUser,
        packages,
        order,
        toast: Object.keys(option).length == 0 ? undefined : option,
      });
    } catch (e) {
      res.render("500", {
        err: e.message,
      });
    }
  },
  // update user
  async updateUser(req, res) {
    try {
      const uId = req.query.uId;
      const editUser = req.body;
      const order = await Order.findOne({ user: uId }).select("amount");
      const packages = await Package.find({ status: "publish" });

      const user = await User.findById(uId);
      const packageId = await Package.findOne({ name: editUser.package });
      delete editUser.package;
      await user.updateOne(
        {
          ...editUser,
          package: packageId._id,
        },
        { runValidators: true },
        async (error, result) => {
          if (error) {
            const err = {};
            editUser["package"] = {
              name: packageId.name,
            };
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
              order: {
                amount: editUser.amount,
              },
            });
          }
          if (result) {
            var msg = encodeMsg("User Updated");
            if (order) {
              await order.updateOne(
                { amount: editUser.amount },
                { runValidators: true }
              );
            } else {
              await Order({
                user: uId,
                package: packageId._id,
                amount: editUser.amount,
                verified: true,
                pay_method: "Offline Payment",
              }).save();
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
