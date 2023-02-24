const Course = require("../models/courses");
const Package = require("../models/package");

const itemDetails = async (cart) => {
  //  package or course detail
  let price, itemName;
  if (cart.itemType == "package" && cart.item) {
    let package = await Package.findById(cart.item);
    itemName = package.name;
    price = Math.round(package.price * ((100 + package.tax) / 100));
  }
  if (cart.itemType == "course" && cart.item) {
    let course = await Course.findById(cart.item);
    itemName = course.name;
    price = course.price;
  }
  return { price, itemName };
};

module.exports = itemDetails;
