const axios = require("axios");

module.exports = (req, res, next) => {
  const recaptcha = req.body["g-recaptcha-response"];
  const secretKey = process.env.recaptcha_secretKey;
  // if (!recaptcha) {
  //   req.flash("error", "reCAPTCHA initialization failed.");
  //   return res.redirect(req.headers.referer || "/login");
  // }

  axios
    .post(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        secret: secretKey,
        response: recaptcha,
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )
    .then((response) => {
      // if (response.data.success) {
        next();
      // } else {
      //   req.flash("error", "Failed to validate reCAPTCHA");
      //   return res.redirect(req.headers.referer || "/login");
      // }
    })
    .catch((error) => {
      req.flash("error", "Failed to validate reCAPTCHA");
      return res.redirect(req.headers.referer || "/login");
    });
};
