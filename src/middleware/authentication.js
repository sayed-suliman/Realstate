const Order = require("../models/order")
const url = require('url');
const { encodeMsg } = require("../helper/createMsg");
const OTP = require("../models/otp");
const { generateCode } = require("../helper/genCode");
const { sendVerificationCode } = require("../controllers/mailServices");

// for authenticated user only
var authenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
        //this used for to avoid going back when user logged out 
        res.set('Cache-Control', 'no-cache,private,no-store,must-revalidate,post-check=0,pre-check=0')
        // pass auth user to all view when used this middleware
        res.locals.user = req.user

        // check whether user bought a package or not
        if (req.user.role == "student") {
            if (!req.user.verified) {
                const otpCode = generateCode();
                await OTP({
                    email: req.user.email,
                    otp: otpCode
                }).save();
                sendVerificationCode(req.user.email, otpCode)
                return res.redirect(url.format({
                    pathname: '/verification',
                    query: {
                        "user": req.user._id.toString()
                    }
                }))
            }
            var order = await Order.findOne({ user: req.user._id })
            if (!order) {
                req.flash('error', "Please make a payment to continue.")
                return res.redirect(url.format({
                    pathname: '/payment',
                    query: {
                        user: req.user._id.toString()
                    }
                }))
            }
        }
        return next()
    } else {
        req.flash("error", "Please! Login to continue.")
        res.redirect('/login')
    }
}
// redirect to dashboard when user is logged in 
var logged_in = (req, res, next) => {
    if (req.isAuthenticated()) {

        req.flash('error', encodeMsg('test', "danger"))
        req.flash('success', encodeMsg('test'))
        res.redirect('/dashboard')
    } else {
        next()
    }
}
var isStudent = (req, res, next) => {
    if (req.user.role === "student") {
        next()
    } else {
        res.redirect("/dashboard")
    }
}
var isAdmin = (req, res, next) => {
    if (req.user.role === "admin") {
        next()
    } else {
        res.redirect("/dashboard")
    }
}

module.exports = { authenticated, logged_in, isStudent, isAdmin }