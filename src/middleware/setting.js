const { default: axios } = require("axios");
const nodemailer = require("nodemailer");

exports.stripeKeyValidation = async (req, res, next) => {
  let validPublic, validSecret;
  const stripeKey = req.body.secretKey;

  const stripe = require("stripe")(stripeKey);
  try {
    await stripe.accounts.retrieve();
  } catch (error) {
    // console.log(error.message);
    req.flash("payment_error", {
      stripe: "Invalid Stripe Secret Key Provided.",
    });
  }
  next();
};

exports.paypalKeyValidation = async (req, res, next) => {
  const clientId = req.body.clientId;
  const clientSecret = req.body.clientSecret;
  const live = !!req.body.paypalMode;
  const paypalBaseURL = live
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const authResponse = await axios.post(
      `${paypalBaseURL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = authResponse.data.access_token;
  } catch (error) {
    // console.log(error.response.data);
    // console.log(error.message);
    req.flash("payment_error", {
      paypal: "Invalid PayPal ID/Secret Provided.",
    });
  }
  next();
};

exports.verifyMail = async (req, res, next) => {
  const { host, user, password, port } = req.body;
  const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass: password },
  });
  try {
    await transport.verify();
  } catch (error) {
    req.flash("mailError", "Invalid Mail Details provided.");
  }
  next();
};
