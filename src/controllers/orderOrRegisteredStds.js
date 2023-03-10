const Order = require("../models/order");

const allOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate(["package", "course", "user"]);
    res.render("dashboard/examples/orders", {
      title: "Dashboard | Orders",
      orders,
    });
  } catch (e) {
    res.render("500", {
      err: e.message,
    });
  }
};
module.exports = { allOrders };
