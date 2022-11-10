const Package = require("../models/package");
const {generateCode} = require('../helper/genCode');
const { sendCode } = require("./mailServices");

module.exports = {
    async checkout(req, res) {
        const id = req.query.package;
        if (id) {
            var package = await Package.findById(id)
            if (package) {
                var { price, tax } = package;
                package.total = price * ((100 + tax) / 100)//total price with tax
                return res.render('checkout', { title: "Checkout", package })
            }
        }
        return res.redirect('/')
    },
    doCheckout(req, res) {
        sendVerificationCode('sulimank418@gmail.com', generateCode())
        res.send(generateCode())
    }
}