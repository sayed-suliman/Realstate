const hbs = require("hbs");
hbs.registerHelper("ifEquals", function (arg1, arg2, block) {
  if (arg1 && arg1.toString() == arg2 && arg2.toString()) {
    return block.fn(this);
  }
  return block.inverse(this);
});

// managing routes.
hbs.registerHelper("userRoute", function (user) {
  const role = user.data.root._locals.user.role;
  if (role === "student") {
    return "";
  } else {
    return "/admin";
  }
});
hbs.registerHelper("or", function (arg1, arg2) {
  return arg1 || arg2;
});
hbs.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
// check status pending expires or active
hbs.registerHelper("checkStatus", (start, end) => {
  const todayDate = new Date();
  if (todayDate > end) {
    return "Expired";
  }
  if (todayDate < start) {
    return "Pending";
  }
  if (todayDate > start && todayDate < end) {
    return "Active";
  }
});
// format date
hbs.registerHelper("formatDate", (date, time = false) => {
  if (date) {
    if (typeof date === "object") {
      let year = date.getFullYear();
      let month =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1;
      let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      let hours =
        date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
      let minutes =
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
      let seconds =
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

      return time
        ? `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        : `${year}-${month}-${day}`;
    }
    if (typeof date === "string") return date;
  }
  return "";
});
// check data if present in collection or not . From packages
hbs.registerHelper("checkData", (data, arr) => {
  let check = false;
  arr.forEach((arrId) => {
    if (
      arrId.name === data ||
      arrId.toString() == data.toString() ||
      arrId._id?.toString() == data.toString()
    ) {
      return (check = true);
    }
  });
  if (check) {
    return "checked";
  } else {
    return "";
  }
});
hbs.registerHelper("returnSelectFromArr", (data, arr) => {
  let check = false;
  arr.forEach((arrId) => {
    if (arrId.name === data || arrId.toString() == data.toString()) {
      return (check = true);
    }
  });
  if (check) {
    return "selected";
  } else {
    return "";
  }
});
hbs.registerHelper("forLoop", function (n, block) {
  var value = "";
  for (var i = 1; i <= n; ++i) value += block.fn(i);
  return value;
});

hbs.registerHelper("checkDraftOrPublish", (arg, arg2) => {
  if (arg === arg2) return "Selected";
  if (arg === arg2) return "Selected";
});

// incrementing by 1
hbs.registerHelper("increment", (arg) => {
  return ++arg;
});

// return checked from 2 arguments
hbs.registerHelper("returnChecked", (arg1, arg2) => {
  if (arg1 == arg2) {
    return "checked";
  }
});

// check if available then return the body
hbs.registerHelper("checkError", (arg, option) => {
  if (arg) {
    return option.fn(this);
  }
});

// check for role or package when admin are adding new user
hbs.registerHelper("checkroleorpackage", (arg1, arg2, option) => {
  if (arg1 == arg2) return option.fn(this);
});
hbs.registerHelper("returnSelected", (arg1) => {
  if (!arg1) return "selected";
});
// increase amount by 20%
hbs.registerHelper("increaseAmount", (subtotal) => {
  return subtotal + subtotal * 0.2;
});
hbs.registerHelper("dateFormat", function (date) {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let day = d.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  return `${year}-${month}-${day}`;
});
