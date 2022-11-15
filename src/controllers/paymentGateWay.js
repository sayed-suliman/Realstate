require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const User = require('../models/users');
const Order = require("../models/order")
const Package = require("../models/package")
const url = require('url');
const { encodeMsg } = require('../helper/createMsg');

const Environment = process.env.NODE_ENV === "production" ?
    paypal.core.LiveEnvironment :
    paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)
module.exports = {
    async stripeAPI(req, res) {
        try {
            const user = await User.findById(req.body.userId).populate('package');
            if (user) {
                const { price, tax, name } = user.package;
                const totalAmount = price * ((100 + tax) / 100)
                const session = await stripe.checkout.sessions.
                    create({
                        payment_method_types: ["card"],
                        // mode change to subscription when needed
                        mode: "payment",
                        line_items: [{
                            price_data: {
                                currency: 'usd',
                                product_data: { name },
                                unit_amount: totalAmount * 100
                            },
                            quantity: 1
                        }],
                        success_url: `${process.env.SERVER_URI}/success?user=${user._id.toString()}&package=${user.package._id}`,
                        cancel_url: `${process.env.SERVER_URI}/payment?user=${user._id.toString()}`
                    })
                res.json({ url: session.url });
                // console.log(session)
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: e.message });
        }
    },
    async stripeSuccess(req, res) {
        try {
            const userId = req.query.user;
            const packageId = req.query.package;
            const user = await User.findById(userId);
            const package = await Package.findById(packageId);
            if (user && package) {
                const order = await Order({
                    user: user._id,
                    package: package._id,
                    amount: package.price * ((100 + package.tax) / 100),
                    pay_method: "Stripe",
                    verified: false//need to change when the payment is confirmed 
                }).save()
                if (order) {
                    return req.login(user, function (err) {
                        if (err) { return next(err); }
                        return res.redirect(url.format({
                            pathname: '/dashboard',
                            query: {
                                msg: encodeMsg('Welcome to Real Estate')
                            }
                        }));
                    });
                }
            }
            return res.redirect(url.format({
                pathname: '/payment',
                query: {
                    user: userId
                }
            }))
        } catch (error) {
            console.log("500 Erro:", error)
            res.render('500')
        }
    },
    async paypalAPI(req, res) {
        try {
            if (req.query.user) {
                const user = await User.findById(req.query.user).populate('package');
                if (user) {
                    return await res.render('paypal', {
                        title: "PayPal",
                        Paypal_client_id: process.env.PAYPAL_CLIENT_ID,
                        user
                    });
                }
            }
            return res.redirect('/')
        } catch (error) {
            res.render('500')
        }
    },
    async doPaypal(req, res) {
        const request = new paypal.orders.OrdersCreateRequest();
        const user = await User.findById(req.body.userId).populate('package');
        const { price, tax, name } = user.package;
        const total = price * ((100 + tax) / 100)
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: total
                        }
                    }
                },
                items: [{
                    name,
                    unit_amount: {
                        currency_code: 'USD',
                        value: total
                    },
                    quantity: 1
                }]
            }]
        })

        try {
            const order = await paypalClient.execute(request);
            res.json({ id: order.result.id })
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },
    async paypalCapture(req, res) {
        console.log(req.body)
        const { id, status, purchase_units } = req.body.order;
        if (status == "COMPLETED") {
            console.log()
            const user = await User.findById(req.body.userId).populate('package')
            if (user) {
                const order = await Order({
                    user: user._id,
                    package: user.package._id,
                    amount: purchase_units[0].amount.value,
                    pay_method: "PayPal",
                    transaction: id,
                    verified: true//because the status is completed
                }).save()
                if (order) {
                    return res.status(201).json({ user })
                }
            }
        }
        return res.json({ failed: "Done" })
    }
}