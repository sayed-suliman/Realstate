const Order = require("../models/order");
const User = require("../models/users")
const url = require('url');
const { encodeMsg } = require("../helper/createMsg");

module.exports = {
    async payment(req, res) {
        var msg = { text: res.locals.error, type: 'danger' }
        const userID = req.query.user
        try {
            if (userID) {
                const user = await User.findById(userID).populate('package');
                if (user.verified) {
                    // admin and regulator redirect to dashboard with msg
                    // they can't buy a package
                    if (user.role == "admin" || user.role == "regulator") {
                        return res.redirect(url.format({
                            pathname: '/dashboard',
                            query: {
                                msg: encodeMsg(`${user.role} can't buy a package.`,'danger')
                            }
                        }));
                    }
                    // if user has not select a package
                    if (user.package == undefined) {
                        const msg = encodeURIComponent("Please! Select a Package to continue.")
                        const type = encodeURIComponent("danger")
                        return res.redirect(`/?msg=${msg}&type=${type}`);
                    }
                    const orders = await Order.find({ user: user._id })
                        .populate('package', '_id').populate('user', '_id');
                    if (orders.length > 0) {
                        // return array of bool
                        var checkAlreadyBuyPackage = orders.map((order) => {
                            return order.package._id.toString() == user.package._id.toString()
                        })

                        const buyOrNot = checkAlreadyBuyPackage.every(el => {
                            if (el == true)
                                return true
                        })
                        if (buyOrNot) {
                            return req.login(user, function (err) {
                                if (err) { return next(err); }
                                return res.redirect(url.format({
                                    pathname: '/dashboard',
                                    query: {
                                        msg: encodeMsg('You have already purchased a package. Please contact with admin for package changing.')
                                    }
                                }));
                            });
                        }
                    }
                    var { price, tax } = user.package;
                    user.total = Math.round(price * ((100 + tax) / 100))
                    return res.render('payment', { title: "Payment", stripe_api: process.env.STRIPE_PUBLISHABLE_KEY, user, alert: res.locals.error.length > 0 ? msg : undefined, showDOB: (user.driver_license == undefined || user.dob == undefined) ? true : false })
                }
                else {
                    return res.redirect('/verification?user=' + req.user._id.toString())
                }
            }
            return res.redirect('/')
        } catch (error) {
            console.log(error.message)
            res.render('500')
        }
    }
}