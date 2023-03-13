const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const express = require("express");
const app = express();
const hbs = require("hbs");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");
const { hexToRgba } = require("./src/helper/colorConverter");
const Setting = require("./src/models/setting");
const Theme = require("./src/models/theme");
const allRoutes = require("./src/routes/routes"); // Routes
require("dotenv").config(); //config env
require("./src/db/conn"); // database connection
require("./src/helper/hbsHelper"); // hbs helper
const { cache } = require("./src/config/cache");
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

// passport js
app.use(passport.initialize());
app.use(passport.session());

// flash initialized
app.use(flash());
app.use(async (req, res, next) => {
  if (cache().get("theme")) {
    res.locals.theme = cache().get("theme");
  } else {
    let newTheme = await Theme.findOne();
    if (newTheme) {
      newTheme.colors["primaryShadow"] = hexToRgba(
        newTheme.colors.primary,
        0.25
      );
      cache().set("theme", newTheme);
    }
    res.locals.theme = newTheme;
  }
  if (cache().get("site")) {
    let { name, logo } = cache().get("site");
    res.locals.site_Title = name;
    res.locals.site_logo = logo;
  } else {
    let setting = await Setting.findOne();
    if (setting) {
      res.locals.site_Title = setting.collegeName;
      res.locals.site_logo = setting.logoPath;
    }
  }

  // for flash
  res.locals.success = req.flash("success");
  res.locals.toast_success = req.flash("alert_success");
  res.locals.toast_error = req.flash("alert_error");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
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

// title on allPages
// hbs.registerHelper("site_Title", function () {
//   if (title) {
//     return title;
//   } else {
//     return process.env.SITE_NAME;
//   }
// });
// // logo on allPage
// hbs.registerHelper("site_logo", function () {
//   if (logo) {
//     return logo;
//   } else {
//     return "/dashboard/dist/img/AdminLTELogo.png";
//   }
// });
app.use(allRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
