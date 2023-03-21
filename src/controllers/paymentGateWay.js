require("dotenv").config();
const paypal = require("paypal-rest-sdk");
const User = require("../models/users");
const Order = require("../models/order");
const url = require("url");
const { encodeMsg } = require("../helper/createMsg");
const Coupon = require("../models/coupons");
const { welcomeEmail } = require("./mailServices");
const itemDetails = require("../helper/itemDetails");
const Setting = require("../models/setting");

module.exports = {
  async paypalAPI(req, res) {
    try {
      const { userId, id, dob, couponId } = req.body;
      const user = await User.findById(userId);
      const cart = req.session.cart;
      if (user) {
        user.updateOne(
          { dob, driver_license: id },
          { runValidators: true },
          async (error, result) => {
            if (error) {
              if (error.message.indexOf("duplicate key error") != -1) {
                res.send({ error: "Driver License is already taken." });
              }
            }
            if (result) {
              let price = (await itemDetails(cart)).price;
              let discount = 0;
              if (couponId) {
                const coupon = await Coupon.findById(couponId)
                  .where("length")
                  .ne(0)
                  .gte("validTill", new Date());
                discount = Number(price) * (Number(coupon.discount) / 100);
              }
              var amount = price - discount;
              const create_payment_json = {
                intent: "sale",
                payer: {
                  payment_method: "paypal",
                },
                redirect_urls: {
                  return_url: `${
                    process.env.SERVER_URI
                  }/success?user=${user._id.toString()}&couponId=${couponId}`,
                  cancel_url: `${
                    process.env.SERVER_URI
                  }/payment?user=${user._id.toString()}`,
                },
                transactions: [
                  {
                    item_list: {
                      items: [
                        {
                          name: (await itemDetails(cart)).itemName,
                          description: "",
                          quantity: 1,
                          price: amount,
                          // tax: '0.45',
                          currency: "USD",
                        },
                      ],
                    },
                    amount: {
                      currency: "USD",
                      total: amount,
                    },
                    payment_options: {
                      allowed_payment_method: "IMMEDIATE_PAY",
                    },
                  },
                ],
              };
              const setting = await Setting.findOne();
              paypal.configure({
                mode:
                  setting.payment.paypal.live || process.env.SITE_DEBUG
                    ? "sandbox"
                    : "live",
                client_id:
                  setting.payment.paypal.id || process.env.PAYPAL_CLIENT_ID,
                client_secret:
                  setting.payment.paypal.secret ||
                  process.env.PAYPAL_CLIENT_SECRET,
              });
              paypal.payment.create(create_payment_json, (e, payment) => {
                if (e) {
                  return res
                    .status(500)
                    .json({ error: e.response.message.error });
                }
                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === "approval_url") {
                    res.send({ url: payment.links[i].href });
                  }
                }
              });
            }
          }
        );
        return true;
      }
      res.send({ url: `${process.env.SERVER_URI}/` });
    } catch (error) {
      res.send({ error: "Server Error" });
    }
  },
  async stripeIntent(req, res) {
    try {
      const cart = req.session.cart;
      const { userId, id, dob, couponId } = req.body;
      const user = await User.findById(userId);
      if (user) {
        user.updateOne(
          { dob, driver_license: id },
          { runValidators: true },
          async (error, result) => {
            if (error) {
              if (error.message.indexOf("duplicate key error") != -1) {
                res.send({ error: "Driver License is already taken." });
              }
            }
            if (result) {
              var price = (await itemDetails(cart)).price;
              let discount = 0;
              if (couponId) {
                const coupon = await Coupon.findById(couponId)
                  .where("length")
                  .ne(0)
                  .gte("validTill", new Date());
                discount = Number(price) * (Number(coupon.discount) / 100);
              }
              var amount = price - discount;
              // Create a PaymentIntent with the order amount and currency
              const setting = await Setting.findOne();
              const stripe = require("stripe")(
                setting.payment.stripe.secret || process.env.STRIPE_SECRET_KEY
              );
              const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // NOTE: STRIPE accept amount in cent.
                currency: "usd",
                setup_future_usage: "off_session",
                // payment_method_types:['card'],
                automatic_payment_methods: {
                  enabled: true,
                },
              });
              res.send({
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id,
                couponId,
              });
            }
          }
        );
      }
    } catch (error) {
      console.log(error.message);
      res.send({ error: "Server error" });
    }
  },
  async stripeIntentCancel(req, res) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(req.body.id);
      res.send(paymentIntent);
    } catch (error) {
      res.send({ error: "Server error" });
    }
  },
  async paymentSuccess(req, res) {
    try {
      const userId = req.query.user;
      const couponId = req.query.couponId;
      const cart = req.session.cart;

      // payment_intent is generated by stripe
      // paymentId is generated by paypal
      const paymentId = req.query.payment_intent || req.query.paymentId;
      let user = await User.findById(userId);
      if (user) {
        let discount = 0,
          { price, itemName } = await itemDetails(cart);
        if (couponId != "undefined") {
          const coupon = await Coupon.findById(couponId).where("length");
          discount = Number(price) * (Number(coupon.discount) / 100);
          await Coupon.findOneAndUpdate(
            { _id: couponId, length: { $gt: 0 } },
            { $inc: { length: -1 } }
          );
        }
        // adding item(course) to user model
        if (cart.itemType == "course") {
          if (
            Array.isArray(user.courses) &&
            !user.courses.includes(cart.item)
          ) {
            user.courses.push(cart.item);
          } else {
            user.courses = [cart.item];
          }
        }
        // adding item(package) to user model
        if (cart.itemType == "package") {
          if (
            Array.isArray(user.courses) &&
            !user.packages.includes(cart.item)
          ) {
            user.packages.push(cart.item);
          } else {
            user.packages = [cart.item];
          }
        }
        // if guest user buy a package then change it role to student
        user.role == "guest" ? (user.role = "student") : "";
        await user.save();

        let orderObj = {
          user: user._id,
          amount: price - discount,
          pay_method: req.query.payment_intent ? "Stripe" : "PayPal",
          transaction: paymentId,
          discount,
          [cart.itemType]: cart.item,
          verified: true,
        };

        const order = await Order(orderObj).save();
        if (order) {
          delete req.session.cart;
          welcomeEmail(user.email, {
            username: user.name,
            orderDate: order.createdAt,
            item: { type: cart.itemType, name: itemName },
            totalPrice: price - discount,
            siteURL: req.protocol + "://" + req.hostname,
          });
          return req.login(user, function (err) {
            if (err) {
              console.log(err);
            }
            return res.redirect(
              url.format({
                pathname: "/dashboard",
                query: {
                  msg: encodeMsg(`Welcome to ${process.env.SITE_NAME}`),
                },
              })
            );
          });
        }
      }
      return res.redirect(
        url.format({
          pathname: "/payment",
          query: {
            user: userId,
          },
        })
      );
    } catch (error) {
      console.log("Payment success error:", error);
      res.redirect("/packages");
    }
  },
};
