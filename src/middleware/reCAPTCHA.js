const axios = require("axios");

module.exports = (req, res, next) => {
  const recaptcha = req.body["g-recaptcha-response"];
  const secretKey = process.env.recaptcha_secretKey;
  const previousRoute = req.headers.referer;
  if (!recaptcha) {
    previousRoute.includes("checkout")
      ? req.flash("signUpError", "reCAPTCHA initialization failed.")
      : req.flash("error", "reCAPTCHA initialization failed.");
    return res.redirect(previousRoute || "/login");
  }

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
      if (response.data.success) {
        next();
      } else {
        previousRoute.includes("checkout")
          ? req.flash("signUpError", "Failed to validate reCAPTCHA")
          : req.flash("error", "Failed to validate reCAPTCHA");
        return res.redirect(previousRoute || "/login");
      }
    })
    .catch((error) => {
      previousRoute.includes("checkout")
        ? req.flash("signUpError", "Failed to validate reCAPTCHA")
        : req.flash("error", "Failed to validate reCAPTCHA");
      return res.redirect(previousRoute || "/login");
    });
};