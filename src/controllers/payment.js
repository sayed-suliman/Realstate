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
                if (user) {
                    if(user.package == undefined){
                        const msg = encodeURIComponent("Please! Select a Package to continue.")
                        const type = encodeURIComponent("danger")
                        return res.redirect(`/?msg=${msg}&type=${type}`);
                    }
                    const orders = await Order.find({ user: user._id })
                        .populate('package', '_id').populate('user', '_id');
                    if (orders.length > 0) {
                        console.log('user order exist')
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
                                        msg: encodeMsg('You have already purchased this package')
                                    }
                                }));
                            });
                        }
                    }
                    var { price, tax } = user.package;
                    user.total = Math.round(price * ((100 + tax) / 100))
                    return res.render('payment', { title: "Payment", stripe_api: process.env.STRIPE_PUBLISHABLE_KEY, user, alert: res.locals.error.length > 0 ? msg : undefined, showDOB: (user.driver_license == undefined || user.dob == undefined) ? true : false })
                }
            }
            return res.redirect('/')
        } catch (error) {
            console.log(error.message)
            res.render('500')
        }
    }
}