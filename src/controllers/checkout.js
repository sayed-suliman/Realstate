const Package = require("../models/package");
const { generateCode } = require('../helper/genCode');
const { sendVerificationCode } = require("./mailServices");
const url = require('url');
const User = require("../models/users");

module.exports = {
    async checkout(req, res) {
        // for login only
        req.session.returnURL = req.url
        try {
            const id = req.query.package;
            if (id) {
                var package = await Package.findById(id).where('status').equals('publish');
                if (package) {
                    if (req.user) {
                        // await User.findByIdAndUpdate(req.user._id, { package: id })
                        return res.redirect(url.format({
                            pathname: '/payment',
                            query: {
                                user: req.user._id.toString()
                            }
                        }))
                    }
                    var { price, tax } = package;
                    package.total = price * ((100 + tax) / 100)//total price with tax
                    return res.render('checkout', { title: "Checkout", package })
                } else {
                    return res.render('404')
                }
            }
            return res.redirect('/')
        } catch (error) {
            res.render('500')
        }
    },
    doCheckout(req, res) {
        sendVerificationCode('sulimank418@gmail.com', generateCode())
        res.send(generateCode())
    }
}