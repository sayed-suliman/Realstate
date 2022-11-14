const Order = require("../models/order");
const User = require("../models/users")
const url = require('url');
const { encodeMsg } = require("../helper/createMsg");

module.exports = {
    async payment(req, res) {
        const userID = req.query.user
        if (userID) {
            const user = await User.findById(userID).populate('package');
            const orders = await Order.find().populate('package');
            if (user) {
                if (orders.length > 0) {
                    var alreadyBuyPackage = orders.map((order) => {
                        return order.package._id.toString() == user.package._id.toString()
                    })
                    if (alreadyBuyPackage.includes(true)) {
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

                return res.render('payment', { title: "Payment", user })
            }
        }
        return res.redirect('/')
    }
}