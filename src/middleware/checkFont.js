const http = require("http");
const https = require("https");
exports.checkFontURL = (req, res, next) => {
  try {
    const URL = req.body.fontFamilyLink;
    const client = URL.startsWith("https") ? https : http;
    client
      .get(URL, (res) => {
        if (res.statusCode != 200) {
          req.flash("font_error", "Invalid font URL.");
          next()
        } else {
          next();
        }
      })
      .on("error", (err) => {
        req.flash("font_error", "Invalid font URL.");
        next()
      });
  } catch (error) {
    req.flash("font_error", error.message);
    next()
  }
};
