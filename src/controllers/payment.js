const Order = require("../models/order");
const User = require("../models/users")
const url = require('url');
const { encodeMsg } = require("../helper/createMsg");

module.exports = {
    async payment(req, res) {
        const userID = req.query.user
        try {
            if (userID) {
                const user = await User.findById(userID).populate('package');
                if (user) {
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
                                        msg: encodeMsg('You have already purchased this package')
                                    }
                                }));
                            });
                        }
                    }
                    var { price, tax } = user.package;
                    user.total = price * ((100 + tax) / 100)

                    return res.render('payment', { title: "Payment", user, showDOB: user.driver_license == undefined ? true : false })
                }
            }
            return res.redirect('/')
        } catch (error) {
            res.render('500')
        }
    }
}