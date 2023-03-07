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
let { theme, site } = require("./src/config/theme");
const Setting = require("./src/models/setting");
const Theme = require("./src/models/theme");
// Routes
const allRoutes = require("./src/routes/routes");
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
let title = site.name;
let logo = site.logo;
let themeSetting;
// passport js
app.use(passport.initialize());
app.use(passport.session());

// config setting
app.locals.site_Title = title;
app.locals.site_logo = logo;

// theme setting
// Theme.findOne()
//   .then((data) => {
//     theme = data;
//   })
//   .catch((err) => console.log(err));

theme.colors["primaryShadow"] = hexToRgba(theme.colors.primary, 0.25);
app.locals.theme = theme;

// flash initialized
app.use(flash());
app.use(async (req, res, next) => {
  // config to middleware
  let themeRes = await Theme.findOne();
  let setting = await Setting.findOne();
  
  res.locals.theme = themeRes || theme;
  res.locals.site_Title = setting.collegeName || title;
  res.locals.site_logo = setting.logoPath || logo;

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
