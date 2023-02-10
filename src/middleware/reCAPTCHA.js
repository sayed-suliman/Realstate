const axios = require("axios");

module.exports = (req, res, next) => {
  const recaptcha = req.body["g-recaptcha-response"];
  const secretKey = process.env.recaptcha_secretKey;
  console.log(secretKey)
  if (!recaptcha) {
    req.flash("error", "Please select reCAPTCHA.");
    return res.redirect("/login");
  }

  axios
    .post("https://www.google.com/recaptcha/api/siteverify", {
      secret: secretKey,
      response: recaptcha,
    })
    .then((response) => {
      if (response.data.success) {
        console.log(response.data);
        next();
      } else {
        req.flash("error", "Failed to validate reCAPTCHA");
        return res.redirect("/login");
      }
    })
    .catch((error) => {
      req.flash("error", error.message);
      return res.redirect("/login");
    });
};
