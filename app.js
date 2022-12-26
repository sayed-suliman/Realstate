const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const express = require("express");
const app = express();
const hbs = require("hbs");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");

// Routes
const allRoutes = require("./src/routes/routes");
const Setting = require("./src/models/setting");
require("dotenv").config();
// database connection
require("./src/db/conn");
//

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie initialized
app.use(cookieParser(process.env.SECRET));
// session Initialized
app.use(
  expressSession({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    maxAge: 60 * 60 * 24 * 14,
    store: new MongoStore({
      mongoUrl: process.env.DB_URI,
      // remove from the database after 14days(ttl)
      ttl: 60 * 60 * 24 * 14,
      touchAfter: 24 * 3600, // update session after 1 day
    }),
  })
);
// site title
let title;
let logo;

// passport js
app.use(passport.initialize());
app.use(passport.session());

// flash initialized
app.use(flash());
app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.toast_success = req.flash("alert_success");
  res.locals.toast_error = req.flash("alert_error");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;

  // site title and logo
  const setting = await Setting.findOne();
  title = setting.collegeName;
  logo = setting.logoPath;
  next();
});

// views path
const viewsPath = path.join(__dirname, "./templates/views");
// partials Path
const partialsPath = path.join(__dirname, "./templates/partials");
// assets path => css,js and images
const publicPath = path.join(__dirname, "./public/");

const port = process.env.PORT || 2200;
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicPath));

hbs.registerHelper("ifEquals", function (arg1, arg2, block) {
  if (arg1 == arg2) {
    return block.fn(this);
  }
  return block.inverse(this);
});

// title on allPages
hbs.registerHelper("site_Title", function () {
  if (title) {
    return title;
  } else {
    return process.env.SITE_NAME;
  }
});
// logo on allPage
hbs.registerHelper("site_logo", function () {
  if (logo) {
    return logo;
  } else {
    return "/dashboard/dist/img/AdminLTELogo.png";
  }
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
hbs.registerHelper("formatDate", (date) => {
  if (date) {
    if (typeof date === "object") {
      let year = date.getFullYear();
      let month =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1;
      let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      return `${year}-${month}-${day}`;
    }
    if (typeof date === "string") return date;
  }
  return "";
});
// check data if present in collection or not . From packages
hbs.registerHelper("checkData", (data, arr) => {
  let check = false;
  arr.forEach((arrId) => {
    if (arrId.name === data) {
      return (check = true);
    }
  });
  if (check) {
    return "checked";
  } else {
    return "";
  }
});
hbs.registerHelper("forLoop", function (n, block) {
  var value = "";
  for (var i = 1; i <= n; ++i) value += block.fn(i);
  return value;
});

// // check data if present in collection or not . From packages
// hbs.registerHelper("checkData",(data,arr)=>{
//     let check = false
//     arr.forEach(cs => {
//         if(cs.name === data){
//             console.log(true)
//             return check = true
//         }
//     });
//     if(check){
//         return 'checked'
//     }else{
//         return ''
//     }
// })
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
  arg1++;
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

app.use(allRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
