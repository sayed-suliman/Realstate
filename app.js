const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const express = require("express");
const app = express();
const hbs = require("hbs");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");

const Setting = require("./src/models/setting");
require("dotenv").config();
// database connection
require("./src/db/conn");
// hbs helper
require("./src/helper/hbsHelper");

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
  if (setting) {
    title = setting.collegeName;
    logo = setting.logoPath;
    // console.log("currently not working env file updation");
    process.env.host = setting.mailHost;
    process.env.mail_port = setting.mailPort;
    process.env.user = setting.mailUser;
    process.env.pass = setting.mailPass;
    process.env.email = setting.mailEmail;
  }
  next();
});
// Routes
const allRoutes = require("./src/routes/routes");
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
app.use(allRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
