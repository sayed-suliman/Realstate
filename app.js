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
const { site } = require("./src/config/theme");
const theme = require("./src/models/theme");
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
app.use((req, res, next) => {
  // for flash
  res.locals.success = req.flash("success");
  res.locals.toast_success = req.flash("alert_success");
  res.locals.toast_error = req.flash("alert_error");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

// theme and app [name,logo] caching
app.use(async (req, res, next) => {
  let { name, logo } = site;
  let { colors } = theme;
  if (!cache().get("theme")) {
    let newTheme = await Theme.findOne();
    if (newTheme) {
      newTheme = newTheme.toObject();
      newTheme.colors["primaryShadow"] = hexToRgba(
        newTheme.colors.primary ?? colors.primary,
        0.25
      );
      delete newTheme._id;
      delete newTheme.__v;
      cache().set("theme", newTheme);
    }
  }
  res.locals.theme = cache().get("theme");
  
  if (!cache().get("site")) {
    let setting = await Setting.findOne();
    if (setting) {
      cache().set("site", {
        name: setting.collegeName ?? name,
        logo: setting.logoPath ?? logo,
      });
    }
  }
  let siteCached = cache().get('site')
  res.locals.site_Title = siteCached.name ?? name;
  res.locals.site_logo = siteCached.logo ?? logo;
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

app.use(allRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
