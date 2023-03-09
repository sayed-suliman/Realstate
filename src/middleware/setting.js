const { default: axios } = require("axios");

exports.stripeKeyValidation = async (req, res, next) => {
  let validPublic, validSecret;
  const stripeKey = req.body.secretKey;
  const stripe = require("stripe")(stripeKey);
  try {
    await stripe.accounts.retrieve();
    validSecret = true;
  } catch (error) {
    // console.log(error.message);
    req.flash("payment_error", {
      stripe: { secret: "Invalid Stripe Secret Key Provided." },
    });
    return next();
  }
  try {
    const publicKey = req.body.publicKey;
    // await stripe.keys.retrieve(publicKey);
    validPublic = true;
  } catch (error) {
    console.log(error.message);
    req.flash("payment_error", {
      stripe: { public: "Invalid Public API Key Provided." },
    });
    return next();
  }
  return validSecret && validPublic && next();
};

exports.paypalKeyValidation = async (req, res, next) => {
  const clientId = req.body.clientId;
  const clientSecret = req.body.clientSecret;

  try {
    console.log(clientId, clientSecret);
    const { data } = axios.post(
      "https://api.paypal.com/v1/oauth2/token",
      {
        grant_type: "client_credentials",
      },
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(data);
    next();
  } catch (error) {
    // console.log(error.message);
    req.flash("payment_error", {
      paypal: { secret: "Invalid Stripe Secret Key Provided." },
    });
    return next();
  }
};
